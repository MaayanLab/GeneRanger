#%%
import os
import pandas as pd
import psycopg2
import json
from collections import Counter
from tqdm import tqdm
from df2pg import copy_from_records
import dotenv; dotenv.load_dotenv()

#%%
df = pd.read_csv('input/Homo_sapiens.gene_info.complete.tsv', sep='\t', index_col=0)

#%%
df = df[df['type_of_gene'] == 'protein-coding']

#%%
con = psycopg2.connect(os.environ['DATABASE_URL'])

#%%
def maybe_split(record):
  ''' NCBI Stores Nulls as '-' and lists '|' delimited
  '''
  if record in {'', '-'}:
    return set()
  return set(record.split('|'))
#
def supplement_dbXref_prefix_omitted(ids):
  ''' NCBI Stores external IDS with Foreign:ID while most datasets just use the ID
  '''
  for id in ids:
    # add original id
    yield id
    # also add id *without* prefix
    if ':' in id:
      yield id.split(':', maxsplit=1)[1]

df['All_synonyms'] = [
  set.union(
    maybe_split(str(gene_info['GeneID'])),
    maybe_split(gene_info['Synonyms']),
    set(supplement_dbXref_prefix_omitted(maybe_split(gene_info['dbXrefs']))),
  )
  for _, gene_info in df.iterrows()
]

#%%
# we find synonyms that exist in multiple entries
synonyms = Counter()
for s in df['All_synonyms']:
  synonyms.update(s)
ambiguous_synonyms = {syn for syn, count in synonyms.items() if count > 1}

#%%
copy_from_records(con, 'gene_info', ('id', 'symbol', 'synonyms', 'chromosome', 'map_location', 'description', 'type_of_gene', 'summary',), (
  dict(
    id=row['GeneID'],
    symbol=row['Symbol'],
    synonyms=json.dumps([syn for syn in row['All_synonyms'] if syn not in ambiguous_synonyms]),
    chromosome=row['chromosome'],
    map_location=row['map_location'],
    description=row['description'],
    type_of_gene=row['type_of_gene'],
    summary=row['summary'],
  )
  for _, row in tqdm(df.iterrows(), total=df.shape[0], desc='Loading genes')
))
