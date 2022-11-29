import pandas as pd

df = pd.read_csv('input/hpa.tsv', sep='\t').dropna()
df['label'] = 'value'
df['description'] = df.apply(lambda r: f"{r['Cell.type']},\n{r['Tissue']}", axis=1)
df = df.groupby(['Gene.name', 'label', 'description'])['Level'].first().unstack()
df.to_csv('preprocessed/hpa.tsv', sep='\t')
