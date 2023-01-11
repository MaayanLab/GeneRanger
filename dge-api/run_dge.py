from flask import Flask, request
from flask_cors import CORS
import pandas as pd
import qnorm
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
from matplotlib_venn import venn2
from maayanlab_bioinformatics.normalization import log2_normalize
from maayanlab_bioinformatics.dge import limma_voom_differential_expression
from maayanlab_bioinformatics.harmonization.ncbi_genes import ncbi_genes_lookup
import rpy2
import json
import io

app = Flask(__name__)
CORS(app)
#gtex_genes = pd.read_csv("/Users/giacomomarino/GeneRanger/GTEx_transcriptomics.tsv", sep='\t', index_col=[0,1])
gtex_genes = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/gtex-gene-stats.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])
gtex_transcript = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/gtex-transcript-stats.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])
archs4_genes = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/archs4-gene-stats.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])
archs4_transcript = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/archs4-transcript-stats.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])
tabula_sapiens = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])
human_cell_atlas = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/hca_10x_donors_tissue-labels_v1.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])

hpm = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/hpm.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', header=0, index_col=0)
hpa = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/hpa.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', header=0, index_col=1)
gtexp = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/gtex_proteomics.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', header=0)
lookup = ncbi_genes_lookup(organism='Mammalia/Homo_sapiens')
gtexp['Name'] = gtexp['gene.id'].map(lambda idx: lookup(idx))
hpa.Tissue = hpa["Tissue"] + ", " + hpa["Cell.type"]
hpa = hpa[hpa['Reliability'] != "Uncertain"] 
gtexp['tissue_specificity'] = gtexp.tissue_specificity.fillna('NA')


background_dict = {'0': [gtex_genes, False], '1': [gtex_transcript, True], '2': [archs4_genes, False], '3': [archs4_transcript, True], '4': [tabula_sapiens, False], '5': [human_cell_atlas, False]}

plt.switch_backend('Agg') 


def read_table(filename):
    if filename.endswith('.tsv') or filename.endswith('.tsv.gz'):
        return pd.read_csv(filename, sep='\t', index_col=0)
    elif filename.endswith('.csv') or filename.endswith('.csv.gz'):
        return pd.read_csv(filename, sep=',', index_col=0)
    elif filename.endswith('.gct') or filename.endswith('.gct.gz'):
        return pd.read_csv(filename, sep='\t', index_col=0, skiprows=2)
    else:
        return pd.read_table(filename, sep=None, engine='python', index_col=0)

# create a dictionary of tissues with their respective cell types
def create_tissue_cell_type_dict(stats):
    final_dict = dict()
    for cell_type in stats.columns:
        tissue_cell_type_list = cell_type.split("-", maxsplit=1)
        final_dict.setdefault(tissue_cell_type_list[0], []).append(tissue_cell_type_list[1])
    return final_dict

# draw a category of boxplots
def display_boxplots(stats, use_transcripts, fig, tissue=None, log_x=False):
    if log_x:
        addstring = 'log2 '
    if use_transcripts:
        name=f"Background ({addstring}Transcript Expression)"
    else:
        name=f"Background ({addstring}Gene Expression)"

    transform = lambda x: np.log2(x+1.) if log_x else x
    IQR = stats.loc['75%']-stats.loc['25%']
    fig.add_trace(go.Box(
        lowerfence=transform(np.maximum(
            stats.loc['min'],
            stats.loc['25%'] - (1.5*IQR),
        )),
        q1=transform(stats.loc['25%']),
        median=transform(stats.loc['50%']),
        q3=transform(stats.loc['75%']),
        upperfence=transform(np.minimum(
            stats.loc['max'],
            stats.loc['75%'] + (1.5*IQR),
        )),
        mean=transform(stats.loc['mean']),
        # sd=None if log_x else stats.loc['std'],
        y=stats.columns,
        name = name,
        orientation='h'
    ))

def parse_bool(s):
    return s == 'true'



@app.route("/pythonapi/rundge", methods=['POST'])
def rundge():
    ## Parse request params
    print(request.form.keys())
    print(request.files.keys())

    file = request.files.get('file', None)
    transcripts = parse_bool(request.form["tumor_transcript_level"])
    organism = request.form["organism"]
    background_id = request.form["precomputed"]
    membrane = parse_bool(request.form["membrane_screener"])
    normalize_to_background = parse_bool(request.form["normalize_to_background"])
    proteomics_vis = parse_bool(request.form["proteomics_vis"])
    
    result_dict = {}

    if file is not None:
        datasbytes = file.read()
        datastring = datasbytes.decode("utf-8") 
        data = []
        idx = []
        lines = datastring.split('\n')
        for i, line in enumerate(lines):
            if i == 0:
                header = line.split('\t')[1:]
            else:
                vals = line.split('\t')
                gene = vals[0]
                if len(vals) > 2:
                    idx.append(str(gene))
                    data.append(np.array(vals[1:], dtype=int))

        ## Load submitted file, map genes/transcripts, combine duplicates
        df_expr = pd.DataFrame(data, index=idx, columns=header)
        df_expr.dropna(inplace=True)
    else:
        df_expr = pd.read_csv('../public/files/GSE49155-patient.tsv', sep='\t', index_col=0, header=0)

    if transcripts:
        df_expr_transcripts = df_expr.index.map(lambda idx: idx.partition('.')[0])
        df_expr = df_expr.groupby(df_expr_transcripts, observed=True).sum()
    else:
        df_expr_genes = df_expr.index.astype(str).map(lambda idx: lookup(idx.partition('.')[0]))
        df_expr = df_expr.groupby(df_expr_genes, observed=True).median()

    result_dict['data_head'] = df_expr.head().to_json()
    
    df_expr.to_csv('test.csv')
    ## Load chosen background, map genes/transcripts, combine duplicates
    df_bg_stats = background_dict[background_id][0]
    transcripts_bg = background_dict[background_id][1]

    if transcripts_bg:
        df_bg_transcripts = df_bg_stats.unstack().index.map(lambda idx: idx.partition('.')[0])
        df_bg_stats = df_bg_stats.unstack().groupby(df_bg_transcripts, observed=True).sum().stack()
    else:
        df_bg_genes = df_bg_stats.unstack().index.map(lambda idx: lookup(idx.partition('.')[0]))
        df_bg_stats = df_bg_stats.unstack().groupby(df_bg_genes, observed=True).median().stack()

    # unstack background dataset -- index is just genes/transcripts, columns are tissue + stat
    df_bg_expr = df_bg_stats.loc[(slice(None), ['25%', '50%', '75%']), :].unstack()

    result_dict['background_head'] = df_bg_expr.head().to_json()

    if transcripts or transcripts_bg:
        df_transcript_gene_map = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/transcript-gene-map.tsv.gz", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', header=0, index_col=0, compression='gzip')

    if membrane:
        proteins = pd.read_csv('https://lomize-group-membranome.herokuapp.com/proteins?fileFormat=csv')
        proteins = proteins[proteins['species_name_cache'] == 'Homo sapiens']
        membrane_proteins = proteins['genename'].map(lookup).dropna()

    if (not transcripts_bg):
        if transcripts:
            # "melt" from wide format to long format with the columns: (index, type, stat, value)
            df_bg_expr_melted = df_bg_expr.melt(ignore_index=False)
            # merge with transcript_gene_map will transform the index from gene_symbol to ensembl_transcript_id
            #  duplicating entries for each statistic accordingly
            df_bg_expr_melted_mapped = pd.merge(
                left=df_bg_expr_melted, left_index=True,
                right=df_transcript_gene_map, right_on='gene_symbol',
            )

            df_bg_expr = df_bg_expr_melted_mapped.pivot(columns=['variable_0', 'variable_1'], values='value')

    ####### CHANGE THIS TO PLOTLY #######
    fig, ((ax11, ax12), (ax21, ax22)) = plt.subplots(2, 2)
    log2_normalize(df_expr).median(axis=1).hist(bins=100, ax=ax11)
    ax11.set_title('Median Expression')
    ax11.set_ylabel('Tumor')
    log2_normalize(df_expr).median(axis=0).hist(bins=100, ax=ax12)
    ax12.set_title('Median Sample Expression')
    log2_normalize(df_bg_expr).median(axis=1).hist(bins=100, ax=ax21)
    ax21.set_ylabel('Background')
    log2_normalize(df_bg_expr).median(axis=0).hist(bins=100, ax=ax22)
    ax21.set_xlabel('$log_2(count)$')
    ax22.set_xlabel('$log_2(count)$')
    plt.tight_layout()

    common_index = list(set(df_expr.index) & set(df_bg_expr.index))
    print(common_index)
    venn2([set(df_expr.index), set(df_bg_expr.index)],
      ['Tumor  ', '  Background'])

    if normalize_to_background:
        target_distribution = df_bg_expr.loc[common_index, :].median(axis=1)
        df_expr_norm = qnorm.quantile_normalize(df_expr.loc[common_index, :], target=target_distribution)
        df_bg_expr_norm = qnorm.quantile_normalize(df_bg_expr.loc[common_index, :], target=target_distribution)

        fig, ((ax11, ax12), (ax21, ax22)) = plt.subplots(2, 2)
        log2_normalize(df_expr_norm).median(axis=1).hist(bins=100, ax=ax11)
        ax11.set_title('Median Expression')
        ax11.set_ylabel('Tumor')
        log2_normalize(df_expr_norm).median(axis=0).hist(bins=100, ax=ax12)
        ax12.set_title('Median Sample Expression')
        log2_normalize(df_bg_expr_norm).median(axis=1).hist(bins=100, ax=ax21)
        ax21.set_ylabel('Background')
        log2_normalize(df_bg_expr_norm).median(axis=0).hist(bins=100, ax=ax22)
        ax21.set_xlabel('$log_2(count)$')
        ax22.set_xlabel('$log_2(count)$')
        plt.tight_layout()
    else:
        df_expr_norm = df_expr.loc[common_index, :]
        df_bg_expr_norm = df_bg_expr.loc[common_index, :]
    print(df_expr_norm)
    print(df_bg_expr_norm)

    dge = limma_voom_differential_expression(
        df_bg_expr_norm, df_expr_norm,
        voom_design=True,
    )
    if transcripts:
        dge['ensembl_transcript_id'] = dge.index
        dge['gene_symbol'] = df_transcript_gene_map.loc[dge.index, 'gene_symbol'].apply(lambda g: lookup(g) or g)
        dge['label'] = dge.apply(lambda r: f"{r['ensembl_transcript_id']} - {r['gene_symbol']}", axis=1)
    else:
        dge['gene_symbol'] = dge.index
        dge['label'] = dge.index

    dge['-log(adj.P.Val)'] = -np.log(dge['adj.P.Val'])
    prod = (np.abs(dge['t']) * dge['logFC'])
    dge['is_deg'] = dge['adj.P.Val'] < 0.05
    dge['is_significant'] = prod > prod.mean() + 3 * prod.std()
    dge['score'] = dge['is_deg'].astype(int) + dge['is_significant'].astype(int)
    #
    

    if not membrane:
        fig = go.Figure()
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[~dge.is_deg, 'logFC'],
            y=dge.loc[~dge.is_deg, '-log(adj.P.Val)'],
            name='Other',
            showlegend=False,
            marker=dict(
                color='black',
            )
        ))
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[dge.is_deg & ~dge.is_significant, 'logFC'],
            y=dge.loc[dge.is_deg & ~dge.is_significant, '-log(adj.P.Val)'],
            text=dge.loc[dge.is_deg & ~dge.is_significant, 'label'],
            name='Differentially Expressed',
            marker=dict(
                color='rgb(255, 221, 221)',
            )
        ))
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[dge.is_significant, 'logFC'],
            y=dge.loc[dge.is_significant, '-log(adj.P.Val)'],
            text=dge.loc[dge.is_significant, 'label'],
            name='Significantly Far from Origin',
            marker=dict(
                color='rgb(239, 85, 59)',
            )
        ))
        fig.update_layout(
            title='Background vs Tumor Differential Expression',
            xaxis_title='Log Fold Change',
            yaxis_title='-Log[Adjusted P-Value]',
            autosize=True,
        )

        result_dict['dge'] = fig.to_json()

    else:
        dge['is_membrane'] = np.in1d(dge['gene_symbol'], membrane_proteins)
        dge['score'] = dge['score'] + dge['is_membrane'].astype(int)
        #
        fig = go.Figure()
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[~dge.is_membrane&~dge.is_significant, 'logFC'],
            y=dge.loc[~dge.is_membrane&~dge.is_significant, '-log(adj.P.Val)'],
            name='Other',
            showlegend=False,
            marker=dict(
                color='black',
            )
        ))
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[dge.is_membrane&~dge.is_significant, 'logFC'],
            y=dge.loc[dge.is_membrane&~dge.is_significant, '-log(adj.P.Val)'],
            name='Membrane Protein',
            marker=dict(
                color='grey',
            )
        ))
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[~dge.is_membrane&dge.is_significant, 'logFC'],
            y=dge.loc[~dge.is_membrane&dge.is_significant, '-log(adj.P.Val)'],
            text=dge.loc[~dge.is_membrane&dge.is_significant, 'label'],
            name='Significant',
            marker=dict(
                color='rgb(239, 85, 59)',
            )
        ))
        fig.add_trace(go.Scattergl(
            mode='markers',
            x=dge.loc[dge.is_membrane&dge.is_significant, 'logFC'],
            y=dge.loc[dge.is_membrane&dge.is_significant, '-log(adj.P.Val)'],
            text=dge.loc[dge.is_membrane&dge.is_significant, 'label'],
            name='Significant Membrane Protein',
            marker=dict(
                color='rgb(99, 110, 250)',
            )
        ))
        fig.update_layout(
            title='Background vs Tumor',
            xaxis_title='Log Fold Change',
            yaxis_title='-Log[Adjusted P-Value]',
            autosize=True,
        )
        result_dict['dge'] = fig.to_json()

        dge_final = dge[dge.score >= 1].sort_values(['score', 't'], ascending=False).iloc[:16]
        pd.set_option('display.max_colwidth', None)
        dge_final['Link'] = dge_final['gene_symbol'].map(lambda g: f"<a href=\"https://cfde-gene-pages.cloud/gene/{g}\">{g}</a>")
        if membrane:
            dge_table = dge_final[['AveExpr', 'logFC', 'P.Value', 'adj.P.Val', 'is_deg', 'is_significant', 'is_membrane', 'score', 'Link']]
        else:
            dge_final[['AveExpr', 'logFC', 'P.Value', 'adj.P.Val', 'is_deg', 'is_significant', 'score', 'Link']]
        result_dict['dge_table'] = dge_table.to_json()

        if proteomics_vis:
            available = pd.DataFrame({'Gene': dge_final['gene_symbol'], 
                'in HPM': dge_final['gene_symbol'].isin(hpm.index), 
                'in HPA': dge_final['gene_symbol'].isin(hpa.index),
                'in GTEx Proteomics': dge_final['gene_symbol'].isin(gtexp.Name)}).drop_duplicates(subset=['Gene'])
            result_dict['avalible'] = available.to_json()
            
        else:
            result_dict['avalible'] = {}

        
        result_dict['targets'] = {}
        for index, row in dge_final.iterrows():
            gene_symbol = row['gene_symbol']
            label = row['label']
            result_dict['targets'][label] = []

            if transcripts_bg and not transcripts:
                # get stats for all transcripts corresponding to this gene symbol
                stats = df_bg_stats.loc[(df_transcript_gene_map[df_transcript_gene_map['gene_symbol'] == gene_symbol].index, slice(None))].unstack()
                # identify per-tissue mask based top 5 medians, the dropped level here is the stats level since we're going
                #  to apply this mask to all stats based on the median (50%)
                mask = (stats.loc[:, (slice(None), '50%')].droplevel(1, axis=1).rank(ascending=False, method='first') <= 5)
                # apply mask to stats. the resulting mask has at most the top 5 transcripts for each tissue
                #  if this results in a transcript missing from all tissues, we'll drop it
                stats = stats.stack()[mask].unstack(0).dropna(how='all', axis=1)
                # flatten column for next step, creating columns of the form: {tissue} - {transcript_id}
                stats.columns = stats.columns.to_flat_index().map(lambda col: ' - '.join(col))
            elif not transcripts_bg and transcripts:
                stats = df_bg_stats.loc[(gene_symbol, slice(None))]
            else:
                stats = df_bg_stats.loc[(index, slice(None))]

            stats.sort_values('mean', axis=1, inplace=True)
            fig = go.Figure()
            
            use_transcripts = transcripts and transcripts_bg
            display_boxplots(stats, use_transcripts, fig, log_x=True)
            if use_transcripts:
                name = f"Tumor (Normalized log2 Transcript Expression)"
            else:
                name = f"Tumor (Normalized log2 Gene Expression)"
            fig.add_trace(go.Box(
            x=np.log2(df_expr_norm.loc[index]+1.),
            name=name,
            orientation='h',
            ))
            fig.update_layout(title=label+f"(Bulk RNA-seq)", height= 300 if len(stats.columns) < 2 else len(stats.columns)*50)
            result_dict['targets'][label].append(fig.to_json())


            if proteomics_vis:
                if gene_symbol in gtexp.Name.values:
                    d = gtexp[gtexp['Name'] == gene_symbol]
                    fig = px.strip(d, y="tissue", x="value",  
                                orientation='h',
                                stripmode="overlay",
                                hover_data=["tissue_specificity"],
                                height=30*d['tissue'].nunique())
                    fig.add_trace(go.Box(x=d['value'],
                                        y=d['tissue'],
                                        orientation='h',
                                        marker=dict(color='#636EFA'),
                                        name="n > 1"))
                    fig.update_layout(title=label+" (GTEx Proteomics)",
                                    autosize=True,
                                    showlegend=False)
                    fig.update_xaxes(title="log2(relative abundance)")
                    fig.update_yaxes(title=None)
                    result_dict['targets'][label].append(fig.to_json())
                
                if gene_symbol in hpm.index:
                    fig = px.scatter(hpm.loc[[gene_symbol]], 
                                    y="Tissue", x="value", 
                                    height=20*hpm.loc[[gene_symbol]].shape[0])
                    fig.update_layout(title=label+" (HPM)", 
                                    autosize=True)
                    fig.update_xaxes(title="Average Spectral Counts")
                    fig.update_yaxes(title=None)
                    result_dict['targets'][label].append(fig.to_json())
                
                if gene_symbol in hpa.index:
                    fig = px.scatter(hpa.loc[[gene_symbol]], 
                                    y="Tissue", x="Level", 
                                    category_orders={"Level": ["Not detected", "Low", "Medium", "High"]}, 
                                    hover_data=["Reliability"],  
                                    hover_name="Tissue",
                                    height=20*hpa.loc[[gene_symbol]].shape[0])
                    fig.update_layout(title=label+" (HPA)", 
                                    showlegend=False, 
                                    autosize=True, 
                                    xaxis={'tickmode':'array', 
                                            'tickvals':[0, 1, 2, 3], 
                                            'ticktext':["Not detected", "Low", "Medium", "High"]})
                    fig.update_xaxes(title="Tissue Expression Level")
                    fig.update_yaxes(title=None)
                    result_dict['targets'][label].append(fig.to_json())
    return result_dict


if __name__ == '__main__':
    app.run(debug=True)