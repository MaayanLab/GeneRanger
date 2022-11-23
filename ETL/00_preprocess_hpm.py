import pandas as pd

df = pd.read_csv('input/hpm.tsv', sep='\t').dropna()
df['label'] = 'value'
df = df.groupby(['Gene', 'label', 'Tissue'])['value'].first().unstack()
df.to_csv('preprocessed/hpm.tsv', sep='\t')
