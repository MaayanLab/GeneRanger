#%%
import os
import re
import json
import click
import numpy as np
import pandas as pd
import psycopg2
from tqdm import tqdm
from df2pg import copy_from_records
import dotenv; dotenv.load_dotenv()

#%%
def load_standard(con, df, name, migration=None):
  ''' Load something in normal form:
                 description1   description2
  gene1  label1  ...
         label2  ...
  '''
  # reshape data
  # label things for easy access
  df.index.names = ['transcript', 'label']
  df.columns.name = 'description'
  # [(gene, label), description] => [gene, (description, label)]
  df = df.unstack('label')

  # step 1 create mapping of transcript versions to stable ids
  transcript_versions = {}
  for t in df.index:
    t_stable = t.split('.')[0]
    if t_stable not in transcript_versions:
      transcript_versions[t_stable] = []
    transcript_versions[t_stable].append(t)

  #  step 2 reconstruct df, calculating statistics
  mapped = {} # { mapped_gene: new_d }
  for transcript, versions in tqdm(transcript_versions.items(), desc='Augmenting'):
      if len(versions) == 1:
        transcript_v, = versions
        new_d = df.loc[transcript_v, :].unstack('label')
        new_d.rename({
          '25%': 'q1',
          '50%': 'median',
          '75%': 'q3',
        }, axis=1, inplace=True)
      else:
        # [gene, (description, label)] => [gene, (label, description)]
        d = df.loc[versions, :].stack('description').unstack('description')
        # d[label] results in [gene, description]
        new_d = pd.DataFrame({
          'min': d['min'].min(),
          'max': d['max'].max(),
          'count': d['count'].sum(),
          # weighted sums
          'q1': (d['25%'] * d['count']).sum() / d['count'].sum(),
          'median': (d['50%'] * d['count']).sum() / d['count'].sum(),
          'q3': (d['75%'] * d['count']).sum() / d['count'].sum(),
          'mean': (d['mean'] * d['count']).sum() / d['count'].sum(),
        })
      new_d.columns.name = 'label'
      IRQ = new_d['q3'] - new_d['q1']
      new_d['lowerfence'] = np.maximum(new_d['q1'] - 1.5*IRQ, new_d['min'])
      new_d['upperfence'] = np.minimum(new_d['q3'] + 1.5*IRQ, new_d['max'])
      mapped[transcript] = new_d.stack('label')

  # assemble augmented dataframe
  df = pd.concat(mapped, copy=False, axis=1).T
  df.index.name = 'transcript'
  
  # find existing transcripts already registered in the db
  with con.cursor() as cur:
    cur.execute('select transcript from transcript')
    existing_transcripts = {transcript for transcript, in cur.fetchall()}

  # here we add only "new" transcripts
  copy_from_records(con, 'transcript', ('transcript',), (
    dict(transcript=transcript)
    for transcript in (set(df.index) - existing_transcripts)
  ), migration=migration)

  # obtain now-complete transcript lookup from transcript symbol to db id
  with con.cursor() as cur:
    cur.execute('select id, transcript from transcript')
    transcript_lookup = {transcript: id for id, transcript in cur.fetchall()}

  # register database, get an id
  with con.cursor() as cur:
    cur.execute('insert into database (dbname) values (%s) returning id', (name,))
    database_id, = cur.fetchone()
    if migration: print(f"insert into database (id, dbname) values ('{database_id}', '{name}');", file=migration)

  # write data associating entry with the database id
  copy_from_records(con, 'data_transcript', ('database', 'transcript', 'values'), (
    dict(
      database=database_id,
      transcript=transcript_lookup[transcript],
      # We move description to the index [label, description]
      #  the json will thus be of the form { label: { description: value, ... }, ... }
      values=json.dumps({
        label: {
          description: value
          for description, value in description_values.items()
          if not pd.isna(value)
        }
        for label, description_values in values.unstack('label').to_dict().items()
      }),
    )
    for transcript, values in tqdm(df.iterrows(), total=df.shape[0], desc='Uploading') # progress bar
  ), migration=migration)

  # collect genes/ids
  with con.cursor() as cur:
    cur.execute('select id, gene from gene')
    gene_lookup = {gene: id for id, gene in cur.fetchall()}

  # find the transcripts that are already mapped
  with con.cursor() as cur:
    cur.execute('select transcript from mapper')
    transcripts_mapped = [transcript[0] for transcript in cur.fetchall()]


  df_transcript_gene_map = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/genes-transcript-mapping.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', header=0)
  gene_transcript_mapping = []
  genes_set = set()

  unmapped = set(transcript_lookup.keys()).difference(set(transcripts_mapped))
  for t in tqdm(unmapped):
    if transcript_lookup[t] not in transcripts_mapped:
      g_row = df_transcript_gene_map[df_transcript_gene_map['Transcript stable ID'] == t]
      g = g_row['Gene name'].values
      g_ensem = g_row['Gene stable ID'].values
      if len(g) > 0  and not pd.isna(g[0]):
        gene_transcript_mapping.append([g[0], t])
        genes_set.add(g[0])
      elif len(g_ensem) > 0:
        gene_transcript_mapping.append([g_ensem[0], t])
        genes_set.add(g_ensem[0])


  copy_from_records(con, 'gene', ('gene',), (
  dict(gene=gene)
  for gene in genes_set.difference(set(gene_lookup.keys()))
  ), migration=migration)

  # collect complete genes/ids
  with con.cursor() as cur:
    cur.execute('select id, gene from gene')
    gene_lookup = {gene: id for id, gene in cur.fetchall()}

  # write data associating entry with the database id
  copy_from_records(con, 'gene_transcript', ('gene', 'transcript'), (
    dict(
      gene=gene_lookup[mapping[0]],
      transcript=transcript_lookup[mapping[1]],
      # We move description to the index [label, description]
      #  the json will thus be of the form { label: { description: value, ... }, ... }
    )
    for mapping in tqdm(gene_transcript_mapping, total=len(gene_transcript_mapping), desc='Uploading') # progress bar
  ), migration=migration)

  return database_id

#%%
@click.command()
@click.option('-i', '--input', type=click.File('r'), help='tsv file in standard form')
@click.option('-n', '--name', type=str, help='name to use in the database')
@click.option('-o', '--output', type=click.Path(file_okay=True), help='write the primary key for the ingested database')
@click.option('-m', '--migration', type=bool, is_flag=True, default=False, help='write migration to a output file')
def ingest(input, name, output, migration):
  con = psycopg2.connect(os.environ['DATABASE_URL'])
  if '.gz' in input.name:
    df = pd.read_csv(input.name, sep='\t', index_col=[0, 1], compression='gzip')
  else:
    df = pd.read_csv(input, sep='\t', index_col=[0, 1])
  with open(output, 'w') as fw:
    database_id = load_standard(con, df, name, migration=fw if migration else None)
    if not migration: fw.write(database_id)

#%%
if __name__ == '__main__':
  ingest()