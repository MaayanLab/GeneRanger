#%%
import pandas as pd
import numpy as np
from tqdm import tqdm

def np_describe(x, axis=0, *, percentiles=[25, 50, 75]):
  ''' Like pandas Series.describe() but operating on numpy arrays / matrices.
  This can be a lot faster especially when working with h5py or sparse data frames.
  :params x: The numpy array to describe
  :params axis: The axis for which to perform describe against
  :returns: dict[str, np.array] A dictionary mapping metric name to results

  From: https://github.com/MaayanLab/maayanlab-bioinformatics/blob/master/maayanlab_bioinformatics/utils/describe.py
  '''
  results = {
    'count': (~np.isnan(x)).sum(axis=axis),
    'mean': x.mean(axis=axis),
    'std': x.std(axis=axis),
    'min': x.min(axis=axis),
    'max': x.max(axis=axis),
  }
  if percentiles:
    percentile = np.percentile(x, percentiles, axis=axis)
    results.update({
      f"{p}%": percentile[i]
      for i, p in enumerate(percentiles)
    })
  return results

#%%
df = pd.read_csv('input/gtex_proteomics.tsv', sep='\t')

df = pd.Series({
  (gene, label, tissue): v
  for (gene, tissue), d in tqdm(df.groupby(['gene.id', 'tissue']), total=df['gene.id'].nunique() * df['tissue'].nunique())
  for label, v in np_describe(d['value']).items()
}).unstack()

df.dropna(how='all', inplace=True)

#%%
df.to_csv('preprocessed/gtex_proteomics.tsv', sep='\t')
