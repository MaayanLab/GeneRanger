import pandas as pd

df = pd.read_csv('input/Homo_sapiens.gene_info.gz', sep='\t', compression='gzip')
df_summary = pd.read_csv('input/Homo_sapiens.gene_summary.tsv', sep='\t')

df = df.dropna(subset=['GeneID'])
df['GeneID'] = df['GeneID'].astype(str)
df_summary = df.dropna(subset=['GeneID'])
df_summary['GeneID'] = df_summary['GeneID'].astype(str)

df_out = pd.merge(
  left=df,
  left_on='GeneID',
  right=df_summary,
  right_on='GeneID',
  how='left',
)
df_out.to_csv('preprocessed/Homo_sapiens.gene_info.complete.tsv', sep='\t')
