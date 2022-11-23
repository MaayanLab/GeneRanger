# Primary credit to https://www.biostars.org/p/2144/
# I modified it to:
#  1. work with python3
#  2. use the ncbi ftp gene_info file as input
#  3. try again if API returns an error

import json
import sys
import time
import traceback
import pathlib
import urllib.request

import click
import numpy as np
import pandas as pd

chunk_size = 100

@click.command()
@click.option('-i', '--input', type=click.Path(readable=True, file_okay=True, path_type=pathlib.Path))
@click.option('-o', '--output', type=click.Path(writable=True, file_okay=True, path_type=pathlib.Path))
def extract_summary(input, output):
  gene_info = pd.read_csv(input, sep='\t', compression='gzip')
  gene_ids = gene_info['GeneID'].unique()
  if output.exists():
    results = pd.read_csv(output)
    gene_ids = np.setdiff1d(gene_ids, results['GeneID'].unique())
  cn = (len(gene_ids)//chunk_size)+1
  for i in range(cn):
    chunk_genes = gene_ids[chunk_size*i:np.min([chunk_size*(i+1), len(gene_ids)])]
    gids = ','.join([str(s) for s in chunk_genes])
    print(f"{i+1}/{cn}")
    url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id={gids}&retmode=json';
    print(url)
    data = None
    for n in range(3):
      try:
        data = json.load(urllib.request.urlopen(url))
        break
      except KeyboardInterrupt:
        sys.exit(1)
      except:
        traceback.print_exc()
        time.sleep(5)
    result = []
    for g in chunk_genes:
      result.append([g, data['result'][str(g)]['summary'] if str(g) in data['result'] else ''])
    pd.DataFrame(result, columns=['GeneID', 'summary']).to_csv(output, index=False, mode='a', sep='\t', header=(i==0))

if __name__ == '__main__':
  extract_summary()
