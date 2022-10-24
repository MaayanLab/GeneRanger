import pandas as pd
import statistics
import numpy as np

print("Starting program...")

df = pd.read_csv('sample_info.csv')

print("Loaded sample_info.csv")

# Links "DepMap_ID" to "stipped_cell_line_name"
cell_lines = {}

for i in range(len(df)):
    cell_line = df.loc[i, "stripped_cell_line_name"]
    cell_lines[df.loc[i, "DepMap_ID"]] = cell_line

df = pd.read_csv('CCLE_RNAseq_reads.csv')

print("Loaded CCLE_RNAseq_reads.csv")

samples = df['Unnamed: 0']

# Removing "Unnamed: 0"
df.rename(columns={"Unnamed: 0": ""}, inplace=True)

genes = list(df.columns.values)

num_genes = range(len(genes))
for i in num_genes:

    gene = genes[i]
    if (gene.find("(") != -1):
        genes[i] = genes[i][gene.find("(")+1:gene.find(")")]

df.columns = genes

# duplicate_genes = list(set([x for x in genes if genes.count(x) > 1]))
#
# for gene in duplicate_genes:
#     sub_df = df[gene]
#     new_col = []
#     for x in range(len(sub_df)):
#         new_val = 0.0
#         for y in range(len(sub_df.columns)):
#             new_val = max(new_val, sub_df.iloc[x].iloc[y])
#         new_col.append(new_val)
#     df = df.drop([gene], axis = 1)
#     df.insert(1, gene, new_col)

df = df.set_index('')

df = df.transpose()

for i in range(len(df.columns)):
    df.rename(columns={df.columns[i]: cell_lines[df.columns[i]]}, inplace=True)

print("Done making dataframe")

df.to_csv("CCLE_transcriptomics.tsv", sep = "\t")

print('Created tsv file')

print('Done!')
