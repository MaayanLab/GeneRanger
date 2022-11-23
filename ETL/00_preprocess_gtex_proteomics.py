import pandas as pd

df = pd.read_csv('input/gtex_proteomics.tsv', sep='\t')
df['label'] = 'value'
df = df.groupby(['gene.id', 'label', 'tissue'])['value'].first().unstack()
df.to_csv('preprocessed/gtex_proteomics.tsv', sep='\t')
