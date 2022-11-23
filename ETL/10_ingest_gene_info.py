#%%
import os
import pandas as pd
import psycopg2
from tqdm import tqdm
from df2pg import copy_from_records
import dotenv; dotenv.load_dotenv()

#%%
df = pd.read_csv('input/Homo_sapiens.gene_info.complete.tsv', sep='\t', index_col=0)

#%%
con = psycopg2.connect(os.environ['DATABASE_URL'])

#%%
copy_from_records(con, 'gene_info', ('id', 'symbol', 'chromosome', 'map_location', 'description', 'type_of_gene', 'summary',), (
  dict(
    id=row['GeneID'],
    symbol=row['Symbol'],
    chromosome=row['chromosome'],
    map_location=row['map_location'],
    description=row['description'],
    type_of_gene=row['type_of_gene'],
    summary=row['summary'],
  )
  for _, row in tqdm(df.iterrows(), total=df.shape[0])
))

#%%
copy_from_records(con, 'gene_info_xref', ('id', 'xref',), (
  dict(id=row['GeneID'], xref=xref)
  for _, row in tqdm(df.iterrows(), total=df.shape[0])
  for xref in set(row['Synonyms'].split('|')) | set(row['dbXrefs'].split('|'))
  if xref not in {'', '-', '-666'}
))
