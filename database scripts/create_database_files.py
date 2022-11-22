
# Important Note: If this script is ever run in the future, make sure to add code to remove
# unnecessary characters like dashes and periods from the names in certain databases
# like ARCHS4 and Tabula Sapiens

import numpy as np
import pandas as pd
import statistics
from maayanlab_bioinformatics.harmonization.ncbi_genes import ncbi_genes_lookup

# Function to convert between Ensembl ID and Gene symbol
lookup = ncbi_genes_lookup()
def convert_symbol(x):
    return lookup(x.split('.')[0])

# https://gist.github.com/u8sand/44d39f35c779192f4a34bf5279356ae3
from df2pg import copy_from_df

# Add proper connection info here
con = psycopg2.connect(
   database="", user='', password='', host='127.0.0.1', port= '5432'
)

#
# NCBI Gene Descriptions
#

# Note that GUCA1A has a typo and is missing the [ symbol.  I manually added it to the .tsv file.
# Also note that this functions under the assumption that most summaries have exactly one [ symbol
# that represents where to cut the string.  It is assumed that the summaries that do not contain [
# have exactly one ( symbol.  This is true when this script was written, but may need to be checked if
# this script is used again in the future.

df = pd.read_csv('Homo_sapiens.gene_info.complete.tsv', sep='\t', header=0)

df = df[["GeneID", "Symbol", "summary"]]

df = df.rename(columns={'GeneID': 'id', 'Symbol': 'symbol', 'summary': 'description'})

def processSummary(summary):
    if (str(summary) == "nan"):
        summary = "No gene description available."
    else:
        if ('[' in summary):
            summary = summary[:summary.rindex('[') - 1]
        else:
            if ('(' in summary):
                summary = summary[:summary.rindex('(') - 1]
    return summary

df['description'] = df['description'].apply(processSummary)

df.to_csv("NCBI_final.tsv", sep = "\t", index=False)

print("Finished with NCBI")

#
# GTEx Transcriptomics
#

df = pd.read_csv('gtex-gene-stats.tsv', sep='\t', header=0)

descriptions = list(df.columns)
descriptions.pop(0)
descriptions.pop(0)

# Converting all values to floats
for desc in descriptions:
    df[desc] = df[desc].astype(float)

df = df.rename(columns={'Name': 'gene', 'Unnamed: 1': 'label'})

df = df.melt(id_vars=['gene', 'label'], var_name="description", value_name="num_value")

df = df[['gene', 'description', 'label', 'num_value']]

def convertColumn(gene):
    converted = convert_symbol(gene)
    if (converted != None):
        return converted
    else:
        return gene

# Converting to gene symbols
df['gene'] = df['gene'].apply(convertColumn)

def combineDuplicates(group):
    return group.head(8)

df2 = df.groupby(['gene', 'description']).filter(lambda x: len(x) > 8).reset_index(drop=True).groupby(['gene', 'description']).apply(combineDuplicates)
df1 = df.groupby(['gene', 'description']).filter(lambda x: len(x) == 8).reset_index(drop=True)

df = pd.concat([df1, df2])

num_groups = len(df)/8
count = 1

def augment_group(group):
    global count
    print("Working on GTEx transcriptomics group " + str(count) + " of " + str(int(num_groups)))

    count += 1
    gene = group.iloc[0,0]
    description = group.iloc[0,1]

    q1 = group.loc[group['label'] == '25%'].squeeze().at['num_value']
    q3 = group.loc[group['label'] == '75%'].squeeze().at['num_value']
    minimum = group.loc[group['label'] == 'min'].squeeze().at['num_value']
    maximum = group.loc[group['label'] == 'max'].squeeze().at['num_value']

    IQR = q3 - q1
    lowerfence = max(minimum, (q1 - (1.5 * IQR)))
    upperfence = min(maximum, (q3 + (1.5 * IQR)))

    data = [[gene, description, 'lowerfence', lowerfence], [gene, description, 'upperfence', upperfence]]
    new_rows = pd.DataFrame(data, columns=['gene', 'description', 'label', 'num_value'])

    return pd.concat([group, new_rows])

df = df.groupby(['gene', 'description'], as_index=False).apply(augment_group).reset_index(drop=True)

df['dbname'] = 'GTEx_transcriptomics'
df['str_value'] = 'NULL'
df = df[['dbname', 'description', 'label', 'num_value', 'str_value']]

df['label'] = df['label'].str.replace('25%','q1')
df['label'] = df['label'].str.replace('50%','median')
df['label'] = df['label'].str.replace('75%','q3')

df.to_csv("GTEx_transcriptomics_final.tsv", sep = "\t", index=False)

print("Finished with GTEx transcriptomics")

#
# ARCHS4
#

df = pd.read_csv('archs4-gene-stats.tsv', sep='\t', header=0)
print("Loaded ARCHS4...")

descriptions = list(df.columns)
descriptions.pop(0)
descriptions.pop(0)

# Converting all values to floats
for desc in descriptions:
    df[desc] = df[desc].astype(float)

# df.info(verbose=True)

df = df.rename(columns={'Unnamed: 0': 'gene', 'Unnamed: 1': 'label'})

df = df.melt(id_vars=['gene', 'label'], var_name="description", value_name="num_value")

df = df[['gene', 'description', 'label', 'num_value']]

num_groups = len(df)/8
count = 1

def augment_group(group):
    global count
    print("Working on ARCHS4 group " + str(count) + " of " + str(int(num_groups)))

    count += 1
    gene = group.iloc[0,0]
    description = group.iloc[0,1]

    q1 = group.loc[group['label'] == '25%'].squeeze().at['num_value']
    q3 = group.loc[group['label'] == '75%'].squeeze().at['num_value']
    minimum = group.loc[group['label'] == 'min'].squeeze().at['num_value']
    maximum = group.loc[group['label'] == 'max'].squeeze().at['num_value']

    IQR = q3 - q1
    lowerfence = max(minimum, (q1 - (1.5 * IQR)))
    upperfence = min(maximum, (q3 + (1.5 * IQR)))

    data = [[gene, description, 'lowerfence', lowerfence], [gene, description, 'upperfence', upperfence]]
    new_rows = pd.DataFrame(data, columns=['gene', 'description', 'label', 'num_value'])

    return pd.concat([group, new_rows])

# Working on chunks of the massive dataframe
chunk_size = 1000000
curr_chunk = 1

for i in range(math.ceil(len(df) / chunk_size)):
    print("Working on ARCHS4 chunk " + str(curr_chunk))
    if (i*chunk_size + (chunk_size-1) > len(df)):
        chunk_df = df.iloc[i*chunk_size:len(df)]
        chunk_df = chunk_df.groupby(['gene', 'description'], as_index=False).apply(augment_group)
        chunk_df.reset_index(drop=True, inplace=True)

        chunk_df['dbname'] = 'ARCHS4'
        chunk_df['str_value'] = 'NULL'
        chunk_df = chunk_df[['dbname', 'gene', 'description', 'label', 'num_value', 'str_value']]

        chunk_df['label'] = chunk_df['label'].str.replace('25%','q1')
        chunk_df['label'] = chunk_df['label'].str.replace('50%','median')
        chunk_df['label'] = chunk_df['label'].str.replace('75%','q3')

        # chunk_df.to_csv("ARCHS4_final_" + str(curr_chunk) + ".tsv", sep = "\t", index=False)
        copy_from_df(con, 'data', chunk_df)
        print("Created file for ARCHS4 chunk " + str(curr_chunk))
        curr_chunk += 1
    else:
        chunk_df = df.iloc[i*chunk_size:i*chunk_size+chunk_size]
        chunk_df = chunk_df.groupby(['gene', 'description'], as_index=False).apply(augment_group)
        chunk_df.reset_index(drop=True, inplace=True)

        chunk_df['dbname'] = 'ARCHS4'
        chunk_df['str_value'] = 'NULL'
        chunk_df = chunk_df[['dbname', 'gene', 'description', 'label', 'num_value', 'str_value']]

        chunk_df['label'] = chunk_df['label'].str.replace('25%','q1')
        chunk_df['label'] = chunk_df['label'].str.replace('50%','median')
        chunk_df['label'] = chunk_df['label'].str.replace('75%','q3')

        # chunk_df.to_csv("ARCHS4_final_" + str(curr_chunk) + ".tsv", sep = "\t", index=False)
        copy_from_df(con, 'data', chunk_df)
        print("Created file for ARCHS4 chunk " + str(curr_chunk))
        curr_chunk += 1

print("Finished with ARCHS4")

#
# Tabula Sapiens
#

df = pd.read_csv('ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv', sep='\t', header=0)
print("Loaded Tabula Sapiens...")

descriptions = list(df.columns)
descriptions.pop(0)
descriptions.pop(0)

# Converting all values to floats
for desc in descriptions:
    df[desc] = df[desc].astype(float)

df = df.rename(columns={'Unnamed: 0': 'gene', 'Unnamed: 1': 'label'})

df = df.melt(id_vars=['gene', 'label'], var_name="description", value_name="num_value")
print("Finished df.melt")

df = df[['gene', 'description', 'label', 'num_value']]

def convertColumn(gene):
    converted = convert_symbol(gene)
    if (converted != None):
        return converted
    else:
        return gene

# Converting to gene symbols
df['gene'] = df['gene'].apply(convertColumn)
print("Converted genes")

count = 1
def combineDuplicates(group):
    global count
    print("Working on group " + str(count))
    count += 1

    group = group.reset_index(drop = True);
    num_duplicates = int(len(group) / 8)

    for i in range(num_duplicates):
        if (group.loc[i*8]['num_value'] == 0):
            s = i*8
            group.drop([s,s+1,s+2,s+3,s+4,s+5,s+6,s+7], axis=0, inplace=True)

    if (len(group) > 8):

        gene = group.iloc[0,0]
        description = group.iloc[0,1]

        combined_count = group.loc[group['label'] == 'count'].num_value.sum()
        combined_mean = (group.loc[group['label'] == 'mean'].num_value.values * group.loc[group['label'] == 'count'].num_value.values).sum() / combined_count
        combined_std = (group.loc[group['label'] == 'std'].num_value.values * group.loc[group['label'] == 'count'].num_value.values).sum() / combined_count
        combined_minimum = group.loc[group['label'] == 'min'].num_value.min()
        combined_q1 = (group.loc[group['label'] == '25%'].num_value.values * group.loc[group['label'] == 'count'].num_value.values).sum() / combined_count
        combined_median = (group.loc[group['label'] == '50%'].num_value.values * group.loc[group['label'] == 'count'].num_value.values).sum() / combined_count
        combined_q3 = (group.loc[group['label'] == '75%'].num_value.values * group.loc[group['label'] == 'count'].num_value.values).sum() / combined_count
        combined_maximum = group.loc[group['label'] == 'max'].num_value.max()

        data = [[gene, description, 'count', combined_count],
                [gene, description, 'mean', combined_mean],
                [gene, description, 'std', combined_std],
                [gene, description, 'min', combined_minimum],
                [gene, description, '25%', combined_q1],
                [gene, description, '50%', combined_median],
                [gene, description, '75%', combined_q3],
                [gene, description, 'max', combined_maximum]]

        return pd.DataFrame(data, columns=['gene', 'description', 'label', 'num_value'])
    else:
        return group

df2 = df.groupby(['gene', 'description']).filter(lambda x: len(x) > 8).reset_index(drop=True).groupby(['gene', 'description']).apply(combineDuplicates)
print("Finished dealing with duplicates.")
df1 = df.groupby(['gene', 'description']).filter(lambda x: len(x) == 8).reset_index(drop=True)
print("Created both smaller dfs")

df = pd.concat([df1, df2])
print("Combined back into one df")

del(df1)
del(df2)

num_groups = len(df)/8
count = 1

def augment_group(group):
    global count
    print("Working on Tabula Sapiens group " + str(count) + " of " + str(int(num_groups)))

    count += 1
    gene = group.iloc[0,0]
    description = group.iloc[0,1]

    q1 = group.loc[group['label'] == '25%'].squeeze().at['num_value']
    q3 = group.loc[group['label'] == '75%'].squeeze().at['num_value']
    minimum = group.loc[group['label'] == 'min'].squeeze().at['num_value']
    maximum = group.loc[group['label'] == 'max'].squeeze().at['num_value']

    IQR = q3 - q1
    lowerfence = max(minimum, (q1 - (1.5 * IQR)))
    upperfence = min(maximum, (q3 + (1.5 * IQR)))

    data = [[gene, description, 'lowerfence', lowerfence], [gene, description, 'upperfence', upperfence]]
    new_rows = pd.DataFrame(data, columns=['gene', 'description', 'label', 'num_value'])

    return pd.concat([group, new_rows])

# Working on chunks of the massive dataframe
chunk_size = 1000000
curr_chunk = 1

for i in range(math.ceil(len(df) / chunk_size)):
    print("Working on Tabula Sapiens chunk " + str(curr_chunk))
    if (i*chunk_size + (chunk_size-1) > len(df)):
        chunk_df = df.iloc[i*chunk_size:len(df)]
        chunk_df = chunk_df.groupby(['gene', 'description'], as_index=False).apply(augment_group)
        chunk_df.reset_index(drop=True, inplace=True)

        chunk_df['dbname'] = 'Tabula_Sapiens'
        chunk_df['str_value'] = 'NULL'
        chunk_df = chunk_df[['dbname', 'gene', 'description', 'label', 'num_value', 'str_value']]

        chunk_df['label'] = chunk_df['label'].str.replace('25%','q1')
        chunk_df['label'] = chunk_df['label'].str.replace('50%','median')
        chunk_df['label'] = chunk_df['label'].str.replace('75%','q3')

        copy_from_df(con, 'data', chunk_df)
        print("Created file for Tabula Sapiens chunk " + str(curr_chunk))
        curr_chunk += 1
    else:
        chunk_df = df.iloc[i*chunk_size:i*chunk_size+chunk_size]
        chunk_df = chunk_df.groupby(['gene', 'description'], as_index=False).apply(augment_group)
        chunk_df.reset_index(drop=True, inplace=True)

        chunk_df['dbname'] = 'Tabula_Sapiens'
        chunk_df['str_value'] = 'NULL'
        chunk_df = chunk_df[['dbname', 'gene', 'description', 'label', 'num_value', 'str_value']]

        chunk_df['label'] = chunk_df['label'].str.replace('25%','q1')
        chunk_df['label'] = chunk_df['label'].str.replace('50%','median')
        chunk_df['label'] = chunk_df['label'].str.replace('75%','q3')

        copy_from_df(con, 'data', chunk_df)
        print("Created file for Tabula Sapiens chunk " + str(curr_chunk))
        curr_chunk += 1

print("Finished with Tabula Sapiens")

#
# HPM
#

df = pd.read_csv('hpm.tsv', sep='\t', header=0)

def processTissue(tissue):
    return tissue.replace('.', ' ')

# Removing . from tissue names
df['Tissue'] = df['Tissue'].apply(processTissue)

df.insert(0, "dbname", ['HPM']*(len(df)), True)
df.insert(3, "label", ['value']*(len(df)), True)
df.insert(5, "str_value", ['NULL']*(len(df)), True)
df = df.rename(columns={'Gene': 'gene', 'Tissue': 'description', 'value': 'num_value'})

df.to_csv("HPM_final.tsv", sep = "\t", index=False)

print("Finished with HPM")

#
# HPA
#

df = pd.read_csv('hpa.tsv', sep='\t', header=0)
df["description"] = df['Tissue'] + ",\n" + df["Cell.type"]
df = df.drop(['Gene', 'Reliability',  'Tissue', 'Cell.type'], axis=1)
df.insert(0, "label", ['value']*(len(df)), True)
df.insert(0, "num_value", ['NULL']*(len(df)), True)
df.insert(0, "dbname", ['HPA']*(len(df)), True)
df = df.rename(columns={'Gene.name': 'gene', 'Level': 'str_value'})
df = df[['dbname', 'gene', 'description', 'label', 'num_value', 'str_value']]

def levels_to_ints(level):
    if (level == "Not detected"):
        return 0
    if (level == "Low"):
        return 1
    if (level == "Medium"):
        return 2
    if (level == "High"):
        return 3

def ints_to_levels(i):
    if (i == 0):
        return "Not detected"
    if (i == 1):
        return "Low"
    if (i == 2):
        return "Medium"
    if (i == 3):
        return "High"

def combineDuplicates(group):
    group['str_value'] = group['str_value'].apply(levels_to_ints)
    gene = group.iloc[0,1]
    description = group.iloc[0,2]

    data = [['HPA', gene, description, 'value', 'NULL', ints_to_levels(int(group['str_value'].max()))]]
    return pd.DataFrame(data, columns=['dbname', 'gene', 'description', 'label', 'num_value', 'str_value'])

df2 = df.groupby(['gene', 'description']).filter(lambda x: len(x) > 1).reset_index(drop=True).groupby(['gene', 'description']).apply(combineDuplicates)
df1 = df.groupby(['gene', 'description']).filter(lambda x: len(x) == 1).reset_index(drop=True)

df = pd.concat([df1, df2])

df.to_csv("HPA_final.tsv", sep = "\t", index=False)

print("Finished with HPA")

#
# GTEx Proteomics
#

df = pd.read_csv('gtex_proteomics.tsv', sep='\t', header=0)

df = df.drop(['tissue_specificity'], axis=1)

df.insert(0, "dbname", ['GTEx_proteomics']*(len(df)), True)
df.insert(3, "label", ['value']*(len(df)), True)
df.insert(5, "str_value", ['NULL']*(len(df)), True)

df = df.rename(columns={'gene.id': 'gene', 'tissue': 'description', 'value': 'num_value'})

def convertColumn(gene):
    converted = convert_symbol(gene)
    if (converted != None):
        return converted
    else:
        return gene

# Converting to gene symbols
df['gene'] = df['gene'].apply(convertColumn)

counter = 1
num_groups = df.groupby(by=['gene', 'description'], as_index = False).ngroups

def calcValues(group):
    global counter
    print("Working on GTEx proteomics group " + str(counter) + " of " + str(num_groups))
    counter += 1

    gene = group.iloc[0,1]
    description = group.iloc[0,2]

    values = list(group['num_value'])

    count = len(values)
    mean = statistics.mean(values)
    std = 0
    if (len(values) > 1):
        std = statistics.stdev(values)
    minimum = min(values)
    q1 = np.percentile(values, 25)
    median = statistics.median(values)
    q3 = np.percentile(values, 75)
    maximum = max(values)
    IQR = q3 - q1
    lowerfence = max(minimum, (q1 - (1.5 * IQR)))
    upperfence = min(maximum, (q3 + (1.5 * IQR)))

    data = [['GTEx_proteomics', gene, description, 'count', count, 'NULL'],
            ['GTEx_proteomics', gene, description, 'mean', mean, 'NULL'],
            ['GTEx_proteomics', gene, description, 'std', std, 'NULL'],
            ['GTEx_proteomics', gene, description, 'min', minimum, 'NULL'],
            ['GTEx_proteomics', gene, description, 'q1', q1, 'NULL'],
            ['GTEx_proteomics', gene, description, 'median', median, 'NULL'],
            ['GTEx_proteomics', gene, description, 'q3', q3, 'NULL'],
            ['GTEx_proteomics', gene, description, 'max', maximum, 'NULL'],
            ['GTEx_proteomics', gene, description, 'lowerfence', lowerfence, 'NULL'],
            ['GTEx_proteomics', gene, description, 'upperfence', upperfence, 'NULL'],]
    return pd.DataFrame(data, columns=['dbname', 'gene', 'description', 'label', 'num_value', 'str_value'])

df = df.groupby(by=['gene', 'description'], as_index = False).apply(calcValues)

df.to_csv("GTEx_proteomics_final.tsv", sep = "\t", float_format='%g', index=False)

print("Finished with GTEx proteomics")

#
# CCLE Transcriptomics
#

df = pd.read_csv('CCLE_transcriptomics.tsv', sep='\t', header=0)

def convertColumn(gene):
    converted = convert_symbol(gene)
    if (converted != None):
        return converted
    else:
        return gene

# Converting to gene symbols
df['Unnamed: 0'] = df['Unnamed: 0'].apply(convertColumn)

# Taking the max for duplicate genes
df = df.groupby(by='Unnamed: 0', as_index = False).max(numeric_only=True)

df = df.melt(id_vars=['Unnamed: 0'], var_name="description", value_name="num_value")

df = df.rename(columns={'Unnamed: 0': 'gene'})

df.insert(0, "dbname", ['CCLE_transcriptomics']*(len(df)), True)
df.insert(3, "label", ['value']*(len(df)), True)
df.insert(5, "str_value", ['NULL']*(len(df)), True)

df.to_csv("CCLE_transcriptomics_final.tsv", sep = "\t", index=False)

print("Finished with CCLE transcriptomics")

#
# CCLE proteomics
#

df = pd.read_csv('CCLE_proteomics.tsv', sep='\t', header=0)

# Taking the max for duplicates
df = df.groupby(by=['name', 'cell_line'], as_index = False).max(numeric_only=True)
df = df.drop(['Unnamed: 0'], axis=1)
df = df.rename(columns={'name': 'gene', 'cell_line': 'description', 'value': 'num_value'})
df.insert(0, "dbname", ['CCLE_proteomics']*(len(df)), True)
df.insert(3, "label", ['value']*(len(df)), True)
df.insert(5, "str_value", ['NULL']*(len(df)), True)

df = df.dropna()

df.to_csv("CCLE_proteomics_final.tsv", sep = "\t", index=False)

print("Finished with CCLE proteomics")
