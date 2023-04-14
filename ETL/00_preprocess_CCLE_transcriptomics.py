#%%
import re
import pandas as pd

#%%
sample_info = pd.read_csv('input/CCLE_sample_info.csv')
cell_lines = {
  row['DepMap_ID']: f"{row['primary_disease']} - {row['stripped_cell_line_name']}"
  for _, row in sample_info.iterrows()
}
del sample_info

#%%
df = pd.read_csv('input/CCLE_RNAseq_reads.csv', index_col=0)
expr = re.compile('^(.+?)( \(\w+\))?$')
genes = { gene: expr.match(gene).group(1) for gene in df.columns }

#%%
# TODO: better aggregation strategies
# map cell lines then genes to get non-duplicated mapped index/columns
df = df.groupby(cell_lines, dropna=True, observed=True).first()
df = df.T
df = df.groupby(genes, dropna=True, observed=True).median()

#%%
genes = df.index
labels = ['value']*df.shape[0]
df.index = pd.MultiIndex.from_arrays([genes, labels], names=['gene', 'label'])

#%%
df.to_csv('preprocessed/CCLE_transcriptomics.tsv', sep='\t')
