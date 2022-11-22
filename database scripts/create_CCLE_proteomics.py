import pandas as pd

print("Starting program...")

df = pd.read_csv('protein_quant_current_normalized.csv')

print("Loaded protein_quant_current_normalized.csv")

# Removing unnecessary columns.  These two important dataframes will be recombined later
gene_df = df[["Gene_Symbol", "Protein_Id"]] # Protein ID and Gene names
values = df.iloc[:, 48:] # Tissue names and values

col_titles = list(values.columns.values)

for i in range(len(col_titles)):
    title = col_titles[i]
    col_titles[i] = title[:title.rfind("_")] # Removing extra info from tissue names
    values.rename(columns={values.columns[i]: col_titles[i]},inplace=True) # Renaming the actual dataframe

values.sort_index(axis=1, inplace=True)

# Combining gene df and values df back together
df = pd.concat([gene_df, values], axis=1)

print("Sorted and processed tissue names")

# Extracted data that will be inserted into the final dataframe
gene_names = [None] * (len(df) * (len(df.columns) - 1))
protein_ids = [None] * (len(df) * (len(df.columns) - 1))
cell_lines = [None] * (len(df) * (len(df.columns) - 1))
tissues = [None] * (len(df) * (len(df.columns) - 1))
values = [None] * (len(df) * (len(df.columns) - 1))

# For each gene
count = 0
for i in range(len(df)):

    sub_df = df.iloc[i]
    gene = sub_df.iloc[0]
    protein_id = sub_df.iloc[1]

    for j in range(len(df.columns) - 2):
        print("Working on row " + str(count+1) + " of 4808635")
        gene_names[count] = gene
        protein_ids[count] = protein_id

        cell_line_and_tissue = df.columns[j+2]

        cell_lines[count] = cell_line_and_tissue[:cell_line_and_tissue.find('_')]
        tissues[count] = cell_line_and_tissue[cell_line_and_tissue.find('_') + 1:]

        values[count] = sub_df.iloc[j+2]
        count = count + 1

print("Processed data")

final_df_data = {'name': gene_names, 'protein_id': protein_ids, "cell_line": cell_lines, "tissue": tissues, "value": values}

final_df = pd.DataFrame(final_df_data)

final_df = final_df.dropna()

print('Inserted data into dataframe')

final_df.to_csv("CCLE_proteomics.tsv", sep = "\t")

print('Created .tsv file')

print('Done!')
