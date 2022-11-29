import pandas as pd

df = pd.read_csv('input/hpm.tsv', sep='\t').dropna()
df['label'] = 'value'
df = df.groupby(['Gene', 'label', 'Tissue'])['value'].first().unstack()
df.columns = df.columns.map(lambda col: col.replace('.', ' '))
df.to_csv('preprocessed/hpm.tsv', sep='\t')
