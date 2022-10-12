import pandas as pd
from sqlalchemy import create_engine
import statistics
import numpy as np

print("Starting program...")

df = pd.read_csv('sample_info.csv')

print("Loaded sample_info.csv")

# Links sample to sample_collection_site and lineage_subtype
cell_lines = {}

# All possible sample_collection_sites and lineage_subtype
all_scs_and_ls = []

for i in range(len(df)):
    scs = df.loc[i, "sample_collection_site"]
    ls = df.loc[i, "lineage_subtype"]

    cell_lines[df.loc[i, "DepMap_ID"]] = [scs, ls]
    if (scs not in all_scs_and_ls):
        all_scs_and_ls.append(scs)
    if ((ls != "nan") and ls not in all_scs_and_ls):
        all_scs_and_ls.append(ls)

# df = pd.read_csv('CCLE_RNAseq_reads.csv', nrows=5) # REMEMBER TO GET RID OF NROWS LATER
df = pd.read_csv('CCLE_RNAseq_reads.csv')

print("Loaded CCLE_RNAseq_reads.csv")

# A dictionary of genes containing a dictionary for each sample_collection_site and lineage_subtype
# Each of those dictionaries store a list of values from CCLE_RNAseq_reads
# These values will be used to calculate mean, median, etc values
gene_data = {}

genes = list(df.columns.values)
genes.pop(0) # Removes "Unnamed: 0" from the actual gene names
gene_symbols = list() # CHECK FOR SYMBOLS IN OTHER FORMATS

# Removing transcript information from gene name
for x in range(len(genes)):
    gene = genes[x]
    if (gene.find(' ') != -1):
        gene_symbols.append(gene[:(gene.find(' '))])
    else:
        gene_symbols.append(gene)

unique_gene_symbols = list(dict.fromkeys(gene_symbols))

# For each sample
for i in range(len(df)):

    sub_df = df.iloc[i]

    # Data from one row of CCLE_RNAseq_reads
    row_gene_data = {}

    # Iterate over a row in CCLE_RNAseq_reads
    for j in range(len(gene_symbols)):
        gene = gene_symbols[j]
        value = sub_df.iloc[j+1]
        if gene in row_gene_data:
            row_gene_data[gene] = row_gene_data[gene] + value
        else:
            row_gene_data[gene] = value

    sample = sub_df.iloc[0]
    sample_collection_site = cell_lines[sample][0]
    lineage_subtype = cell_lines[sample][1]

    # Adding this row's data to gene_data
    for gene in unique_gene_symbols:
        if gene in gene_data:
            if sample_collection_site in gene_data[gene]:
                gene_data[gene][sample_collection_site].append(row_gene_data[gene])
            else:
                gene_data[gene][sample_collection_site] = [row_gene_data[gene]]
            if lineage_subtype != "nan":
                if lineage_subtype in gene_data[gene]:
                    gene_data[gene][lineage_subtype].append(row_gene_data[gene])
                else:
                    gene_data[gene][lineage_subtype] = [row_gene_data[gene]]
        else:
            gene_data[gene] = {}
            gene_data[gene][sample_collection_site] = [row_gene_data[gene]]
            if (lineage_subtype != "nan"):
                gene_data[gene][lineage_subtype] = [row_gene_data[gene]]

print("Extracted data from file")

# Data to be inserted into the final dataframe
gene_names = []
desc = []
values = []

# Setting up genes
for gene in unique_gene_symbols:
    for x in range(0, 8):
        gene_names.append(gene)

# Setting up desc
for i in range(len(unique_gene_symbols)):
    desc.append("count")
    desc.append("mean")
    desc.append("std")
    desc.append("min")
    desc.append("25%")
    desc.append("50%")
    desc.append("75%")
    desc.append("max")



# Setting up values
col_num = 0
for x in all_scs_and_ls:
    col_num = col_num + 1
    print("Calculating column " + str(col_num) + " of 147")
    column = [None] * 434776
    i = 0
    for gene in unique_gene_symbols:
        if (x in gene_data[gene]):
            data = gene_data[gene][x]
            count = len(data)
            mean = statistics.mean(data)
            std = 0
            if (len(data) > 1):
                std = statistics.stdev(data)
            minimum = min(data)
            q1 = np.percentile(data, 25)
            median = statistics.median(data)
            q3 = np.percentile(data, 75)
            maximum = max(data)
            # column = column + [count, mean, std, minimum, q1, median, q3, maximum]
            column[i] = count
            column[i+1] = mean
            column[i+2] = std
            column[i+3] = minimum
            column[i+4] = q1
            column[i+5] = median
            column[i+6] = q3
            column[i+7] = maximum
            i = i + 8
        else:
            # column = column + [0, 0, 0, 0, 0, 0, 0, 0]
            column[i] = 0
            column[i+1] = 0
            column[i+2] = 0
            column[i+3] = 0
            column[i+4] = 0
            column[i+5] = 0
            column[i+6] = 0
            column[i+7] = 0
            i = i + 8
    values.append(column)

print("Calculated values")

final_df_data = {'name': gene_names, "": desc}

for i in range(len(all_scs_and_ls)):
    final_df_data.update({all_scs_and_ls[i]: values[i]})

final_df = pd.DataFrame(final_df_data)

print('Inserted data into dataframe')

final_df.to_csv("CCLE_transcriptomics.tsv", sep = "\t")

print('Created tsv file')

print('Done!')
