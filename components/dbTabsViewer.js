
import { Box } from "@mui/system";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GeneAndGraphDescription from './geneAndGraphDescription';
import GraphMissing from './graphMissing';
import styles from '../styles/Main.module.css';
import PropTypes from 'prop-types';
import { Container} from '@mui/material';
import dynamic from 'next/dynamic';


const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});


export default function DbTabsViewer(props) {
    var database = props.database
    var setDatabase = props.setdatabase
    var result = props.result
    const geneStats = JSON.parse(props.geneStats)
    var gene = props.gene


    var gene_data = {
        type: 'box',
        mean: [geneStats[gene]['mean']],
        std: [geneStats[gene]['std']],
        y: ['Expression in submitted file'],
        lowerfence: [null],
        upperfence: [null],
        q1: [geneStats[gene]['mean'] - geneStats[gene]['std']],
        median: [geneStats[gene]['mean']],
        q3: [geneStats[gene]['mean'] + geneStats[gene]['std']],
        orientation: 'h',
    }


    console.log(gene_data)

    function TabPanel(props) {
        const {children, value, index, classes, ...other} = props;
    
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Container>
                        <Box>
                            {children}
                        </Box>
                    </Container>
                )}
            </div>
        );
    }
      
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };


    let gtex_transcriptomics = null, archs4 = null, tabula_sapiens = null, hpm = null, hpa = null, gtex_proteomics = null, ccle_transcriptomics = null, ccle_proteomics = null;
    let hpa_length = 0, gtex_proteomics_length = 0, ccle_transcriptomics_length = 0, ccle_proteomics_length = 0;

    if ('GTEx_transcriptomics' in result.sorted_data) {
        gtex_transcriptomics = result.sorted_data.GTEx_transcriptomics;
    }
    if ('ARCHS4' in result.sorted_data) {
        archs4 = result.sorted_data.ARCHS4;
        console.log(archs4)
    } 
    if ('Tabula_Sapiens' in result.sorted_data) {
        tabula_sapiens = result.sorted_data.Tabula_Sapiens;
    } 
    if ('HPM' in result.sorted_data) {
        hpm = result.sorted_data.HPM;
    } 
    if ('HPA' in result.sorted_data) {
        hpa = result.sorted_data.HPA;
        hpa_length = Object.keys(hpa.y).length;
    } 
    if ('GTEx_proteomics' in result.sorted_data) {
        gtex_proteomics = result.sorted_data.GTEx_proteomics;
        gtex_proteomics_length = Object.keys(gtex_proteomics.y).length;
    }
    if ('CCLE_transcriptomics' in result.sorted_data) {
        ccle_transcriptomics = result.sorted_data.CCLE_transcriptomics;
        ccle_transcriptomics_length = Object.keys(ccle_transcriptomics.y).length;
    }
    if ('CCLE_proteomics' in result.sorted_data) {
        ccle_proteomics = result.sorted_data.CCLE_proteomics;
        ccle_proteomics_length = Object.keys(ccle_proteomics.y).length;
    }

    let ARCHS4_link = <a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">ARCHS4</a>;
    let GTEx_transcriptomics_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">GTEx transcriptomics</a>;
    let Tabula_Sapiens_link = <a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">Tabula Sapiens</a>;
    let CCLE_transcriptomics_link = <a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;
    let HPM_link = <a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">Human Proteome Map (HPM)</a>;
    let HPA_link = <a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">Human Protein Atlas (HPA)</a>;
    let GTEx_proteomics_link = <a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">GTEx proteomics</a>;
    let CCLE_proteomics_link = <a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;

    let ARCHS4_str = 'ARCHS4, developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
    let GTEx_transcriptomics_str = 'GTEx transcriptomics provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';
    let Tabula_Sapiens_str = 'Tabula Sapiens is a gene expression atlas created from single cell RNA-seq data collected from multiple tissues of 16 postmortem donors. The processed data contains average expression of each human gene in 486 cell types.';
    let CCLE_transcriptomics_str = 'The Cancer Cell Line Encyclopedia (CCLE) transcriptomics dataset contains gene expression data collected with RNA-seq from over 1000 human pan-cancer cell lines.';
    let HPM_str = 'The Human Proteome Map (HPM) contains data from LC-MS/MS proteomics profiling protein expression in 30 human tissues collected from 17 adult postmortem donors.';
    let HPA_str = 'The Human Protein Atlas (HPA) contains protein expression data from 44 normal human tissues derived from antibody-based protein profiling using immunohistochemistry.';
    let GTEx_proteomics_str = 'The GTEx proteomics dataset has relative protein levels for more than 12,000 proteins across 32 normal human tissues. The data was collected using tandem mass tag (TMT) proteomics to profile tissues collected from 14 postmortem donors.';
    let CCLE_proteomics_str = 'The Cancer Cell Line Encyclopedia (CCLE) proteomics dataset contains protein expression in 375 pan-cancer cell lines. Data was collected by quantitative multiplex mass spectrometry proteomics.';

    let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>
    let Tabula_Sapiens_links = <><a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_transcriptomics_links = <><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPM_links = <><a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPA_links = <><a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_proteomics_links = <><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_proteomics_links = <><a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">citation</a></>

    let ARCHS4_desc_d = <>{ARCHS4_str} <span style={{whiteSpace: 'nowrap'}}>{ARCHS4_links}</span></>;
    let GTEx_transcriptomics_desc_d = <>{GTEx_transcriptomics_str} <span style={{whiteSpace: 'nowrap'}}>{GTEx_transcriptomics_links}</span></>;
    let Tabula_Sapiens_desc_d = <>{Tabula_Sapiens_str} <span style={{whiteSpace: 'nowrap'}}>{Tabula_Sapiens_links}</span></>;
    let CCLE_transcriptomics_desc_d = <>{CCLE_transcriptomics_str} <span style={{whiteSpace: 'nowrap'}}>{CCLE_transcriptomics_links}</span></>;
    let HPM_desc_d = <>{HPM_str} <span style={{whiteSpace: 'nowrap'}}>{HPM_links}</span></>;
    let HPA_desc_d = <>{HPA_str} <span style={{whiteSpace: 'nowrap'}}>{HPA_links}</span></>;
    let GTEx_proteomics_desc_d = <>{GTEx_proteomics_str} <span style={{whiteSpace: 'nowrap'}}>{GTEx_proteomics_links}</span></>;
    let CCLE_proteomics_desc_d = <>{CCLE_proteomics_str} <span style={{whiteSpace: 'nowrap'}}>{CCLE_proteomics_links}</span></>;

    let archs4_title = props.gene + ' Expression across ARCHS4 Cells & Tissues (RNA-seq)';
    let gtex_transcriptomics_title = props.gene + ' Expression across GTEx Tissues (RNA-seq)';
    let tabula_sapiens_title = props.gene + ' Expression across Tabula Sapiens Cells (RNA-seq)';
    let hpm_title = props.gene + ' Protein Expression across HPM Cells & Tissues';
    let hpa_title = props.gene + ' Protein Expression across HPA Cells & Tissues';
    let gtex_proteomics_title = props.gene + ' Protein Expression across GTEx Tissues';
    let ccle_transcriptomics_title = props.gene + ' Expression across CCLE Cell Lines';
    let ccle_proteomics_title = props.gene + ' Protein Expression across CCLE Cell Lines';


    console.log(archs4)


    return (
    <div style={{ width: '80%' }}>
        <Box sx={{ width: '100%' }}>
            <Box className={styles.tabsBox}>
                <Tabs value={database} onChange={(event, newValue) => { setDatabase(newValue) }} aria-label="basic tabs example" variant="fullWidth" centered>
                    {
                        (database == 0)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="ARCHS4 logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="ARCHS4 logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} />} />
                    }
                    {
                        (database == 1)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="GTEx logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="GTEx logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} />} />
                    }
                    {
                        (database == 2)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="Tabula Sapiens logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="Tabula Sapiens logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} />} />
                    }
                    {
                        (database == 3)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="CCLE logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="CCLE logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} />} />
                    }
                    {
                        (database == 4)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="HPM logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="HPM logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} />} />
                    }
                    {
                        (database == 5)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="HPA logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="HPA logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} />} />
                    }
                    {
                        (database == 6)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="GTEx logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="GTEx logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} />} />
                    }
                    {
                        (database == 7)
                            ?
                            <Tab icon={<img className={styles.tabLogo} alt="CCLE logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogo} alt="CCLE logo" src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} />} />
                    }
                </Tabs>
            </Box>
            <TabPanel value={database} index={0}>
                {
                    archs4 != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={ARCHS4_link} database_desc={ARCHS4_desc_d} />
                            <div style={{ height: '13000px' }}>
                                <Plot
                                    data={[archs4, gene_data]}
                                    layout={{
                                        title: archs4_title,
                                        yaxis: {
                                            automargin: true
                                        },
                                        xaxis: {
                                            title: {
                                                text: 'RNA counts',
                                            }
                                        },
                                        showlegend: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel style={{ width: '100%' }} value={database} index={1}>
                {
                    gtex_transcriptomics != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={GTEx_transcriptomics_link} database_desc={GTEx_transcriptomics_desc_d} />
                            <div style={{ height: '1500px' }}>
                                <Plot
                                    data={[gtex_transcriptomics, gene_data]}
                                    layout={{
                                        title: gtex_transcriptomics_title, yaxis: { automargin: true },
                                        xaxis: {
                                            title: {
                                                text: 'RNA counts',
                                            }
                                        },
                                        showlegend: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                    id={"gtex_transcriptomics"}
                                />
                            </div>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={2}>
                {
                    tabula_sapiens != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={Tabula_Sapiens_link} database_desc={Tabula_Sapiens_desc_d} />
                            <div style={{ height: '13000px' }}>
                                <Plot
                                    data={[tabula_sapiens, gene_data]}
                                    layout={{
                                        title: tabula_sapiens_title,
                                        yaxis: {
                                            automargin: true
                                        },
                                        xaxis: {
                                            title: {
                                                text: 'RNA counts',
                                            }
                                        },
                                        showlegend: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={3}>
                {
                    ccle_transcriptomics != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={CCLE_transcriptomics_link} database_desc={CCLE_transcriptomics_desc_d} />
                            <div style={{ height: '50000px' }}>
                                <Plot
                                    data={[ccle_transcriptomics]}
                                    layout={{
                                        title: ccle_transcriptomics_title,
                                        yaxis: {
                                            automargin: true,
                                            range: [-0.5, ccle_transcriptomics_length]
                                        },
                                        xaxis: {
                                            title: {
                                                text: 'TPM',
                                            }
                                        }
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={4}>
                {
                    hpm != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={HPM_link} database_desc={HPM_desc_d} />
                            <div style={{ height: '1000px' }}>
                                <Plot
                                    data={[hpm]}
                                    layout={{
                                        title: hpm_title,
                                        yaxis: {
                                            automargin: true
                                        },
                                        xaxis: {
                                            title: {
                                                text: 'Average Spectral Counts',
                                            }
                                        }
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={5}>
                {
                    hpa != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={HPA_link} database_desc={HPA_desc_d} />
                            <div style={{ height: '4500px' }}>
                                <Plot
                                    data={[hpa]}
                                    layout={{
                                        title: hpa_title,
                                        yaxis: {
                                            automargin: true,
                                            range: [-0.5, hpa_length]
                                        },
                                        xaxis: {
                                            "categoryorder": "array",
                                            "categoryarray": ["Not detected", "Low", "Medium", "High"],
                                            title: {
                                                text: 'Tissue Expression Level',
                                            }
                                        },
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={6}>
                {
                    gtex_proteomics != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={GTEx_proteomics_link} database_desc={GTEx_proteomics_desc_d} />
                            <div style={{ height: (gtex_proteomics_length * 50).toString() + 'px' }}>
                                <Plot
                                    data={[gtex_proteomics]}
                                    layout={{
                                        title: gtex_proteomics_title,
                                        showlegend: false,
                                        yaxis: {
                                            automargin: true
                                        },
                                        xaxis: {
                                            title: {
                                                text: 'log2(relative abundance)',
                                            }
                                        }
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={7}>
                {
                    ccle_proteomics != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={CCLE_proteomics_link} database_desc={CCLE_proteomics_desc_d} />
                            <div style={{ height: (ccle_proteomics_length * 25).toString() + 'px' }}>
                                <Plot
                                    data={[ccle_proteomics]}
                                    layout={{
                                        title: ccle_proteomics_title,
                                        yaxis: {
                                            automargin: true,
                                            range: [-0.5, ccle_proteomics_length]
                                        },
                                        xaxis: {
                                            title: {
                                                text: 'Normalized Protein Quantity',
                                            }
                                        }
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                            </div>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
        </Box>
    </div>
    );
}