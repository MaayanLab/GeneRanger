import pandas as pd

print("Starting program...")

df = pd.read_csv('protein_quant_current_normalized.csv')

print("Loaded protein_quant_current_normalized.csv")

gene_df = df[["Gene_Symbol"]]
values = df.iloc[:, 48:]

tissues = list(values.columns.values)
tissues.pop(0) # Removes "gene_symbols"

for i in range(len(tissues)):
    tissue = tissues[i]
    tissues[i] = tissue[tissue.find("_")+1:tissue.rfind("_")]

for i in range(len(tissues)):
    values.rename(columns={values.columns[i]: tissues[i]},inplace=True)

values.sort_index(axis=1, inplace=True)

df = pd.concat([gene_df, values], axis=1)

print("Sorted and processed tissue names")

gene_names = [None] * (len(df) * (len(df.columns) - 1))
tissues = [None] * (len(df) * (len(df.columns) - 1))
values = [None] * (len(df) * (len(df.columns) - 1))

# For each gene
count = 0
for i in range(len(df)):

    sub_df = df.iloc[i]
    gene = sub_df.iloc[0]

    for i in range(len(df.columns) - 1):
        print("Working on row " + str(count+1) + " of 4808635")
        gene_names[count] = gene
        tissues[count] = df.columns[i+1]
        values[count] = sub_df.iloc[i+1]
        count = count + 1

print("Processed data")

final_df_data = {'name': gene_names, "tissue": tissues, "value": values}

final_df = pd.DataFrame(final_df_data)

print('Inserted data into dataframe')

final_df.to_csv("CCLE_proteomics.tsv", sep = "\t")

print('Created tsv file')

print('Done!')
