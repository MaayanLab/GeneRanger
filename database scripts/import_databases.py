import pandas as pd
from sqlalchemy import create_engine
from maayanlab_bioinformatics.harmonization.ncbi_genes import ncbi_genes_lookup

# This script imports gtex.csv, archs4.csv, tabula_sapiens.tsv, hpm.csv, hpa.csv, and gtex_proteomics.csv.
# All files must be converted to .csv before use EXCEPT for tabula_sapiens.

# Replace with database String
database = ''

# Connect to postgres
engine = create_engine(database)

# Function to convert between Ensembl ID and HGNC symbol
lookup = ncbi_genes_lookup()
def convert_symbol(x):
    return lookup(x.split('.')[0])

#
# Transcriptomics Databases
#
print("Working on transcriptomics databases...")

# Obtain and transform data
df = pd.read_csv('gtex.csv', index_col=[0, 1])
df = (df.stack().unstack(level=1).reset_index()).rename({'Name': 'name', 'level_1': 'tissue', '50%': 'median', '25%': 'q1', '75%': 'q3'}, axis=1)
df['name'] = df['name'].apply(convert_symbol)
print("Finished processing gtex_transcriptomics.")

# Import data into postgres
df.to_sql("gtex_transcriptomics", engine)
print("Imported gtex_transcriptomics.")


df = pd.read_csv('archs4.csv', index_col=[0, 1])
df = (df.stack().unstack(level=1).reset_index()).rename({'level_0': 'name', 'level_1': 'tissue', '50%': 'median', '25%': 'q1', '75%': 'q3'}, axis=1)
print("Finished processing archs4.")

df.to_sql("archs4", engine)
print("Imported archs4")

df = pd.read_csv('tabula_sapiens.tsv', sep='\t', header=0)
df = df.rename({'Unnamed: 0': 'name', 'Unnamed: 1': 'desc'}, axis=1)
df['name'] = df['name'].apply(convert_symbol)
print("Finished processing tabula_sapiens.")

df.to_sql("tabula_sapiens", engine)
print("Imported tabula_sapiens.")

#
# Proteomics Databases
#
print("Working on proteomics databases...")

df = pd.read_csv('hpm.csv')
df.columns = [c.lower() for c in df.columns]
print("Finished processing hpm.")

df.to_sql("hpm", engine)
print("Imported hpm.")

df = pd.read_csv('hpa.csv')
df.columns = [c.lower() for c in df.columns]
print("Finished processing hpa.")

df.to_sql("hpa", engine)
print("Imported hpa.")

df = pd.read_csv('gtex_proteomics.csv')
df.columns = [c.lower() for c in df.columns]
df['gene.id'] = df['gene.id'].apply(convert_symbol)
print("Finished processing gtex_proteomics.")

df.to_sql("gtex_proteomics", engine)
print("Imported gtex_proteomics.")
