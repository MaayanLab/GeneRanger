
import { Box } from "@mui/system";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GeneAndGraphDescription from './geneAndGraphDescription';
import GraphMissing from './graphMissing';
import styles from '../styles/Main.module.css';
import PropTypes from 'prop-types';
import { Container} from '@mui/material';
import dynamic from 'next/dynamic';
import { useRuntimeConfig } from "./runtimeConfig";


const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});


export default function DbTabsViewer(props) {
    const runtimeConfig = useRuntimeConfig()
    var database = props.database
    var setDatabase = props.setdatabase
    var result = props.sorted_data
    var transcript = props.transcript
    var NCBI_data = props.NCBI_data

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


    let gtex_transcript = null, archs4_transcript = null;

    if ('GTEx_transcript' in result) {
        gtex_transcript = result.GTEx_transcript;
    }
    if ('ARCHS4_transcript' in result) {
        archs4_transcript = result.ARCHS4_transcript;
    } 
   

    let ARCHS4_link = <a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">ARCHS4</a>;
    let GTEx_transcriptomics_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">GTEx transcriptomics</a>;
   
    let ARCHS4_str = 'ARCHS4, developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
    let GTEx_transcriptomics_str = 'GTEx transcriptomics provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';

    let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>

    let ARCHS4_desc_d = <>{ARCHS4_str} <span style={{whiteSpace: 'nowrap'}}>{ARCHS4_links}</span></>;
    let GTEx_transcriptomics_desc_d = <>{GTEx_transcriptomics_str} <span style={{whiteSpace: 'nowrap'}}>{GTEx_transcriptomics_links}</span></>;

    let archs4_title = props.transcript + ' Expression across ARCHS4 Cells & Tissues (RNA-seq)';
    let gtex_transcriptomics_title = props.transcript + ' Expression across GTEx Tissues (RNA-seq)';

    return (
    <div style={{ width: '80%' }}>
        <Box sx={{ width: '100%' }}>
            <Box className={styles.tabsBox}>
                <Tabs value={database} onChange={(event, newValue) => { setDatabase(newValue) }} aria-label="basic tabs example" variant="fullWidth" scrollButtons={true} centered>
                    {
                        (database == 0)
                            ?
                            <Tab icon={<img className={styles.tabLogoTranscript} alt="ARCHS4 logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogoTranscript}  alt="ARCHS4 logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} />} />
                    }
                    {
                        (database == 1)
                            ?
                            <Tab icon={<img className={styles.tabLogoTranscript} alt="GTEx logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} />} />
                            :
                            <Tab icon={<img className={styles.grayTabLogoTranscript} alt="GTEx logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} />} />
                    }
                </Tabs>
            </Box>
            <TabPanel value={database} index={0}>
                {
                    archs4_transcript != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.transcript}</h1>
                            <GeneAndGraphDescription NCBI_data={NCBI_data} transcript={transcript} gene={props.transcript} database={ARCHS4_link} database_desc={ARCHS4_desc_d} data={archs4_transcript}/>
                            <div style={{ height: '13000px' }}>
                                <Plot
                                    data={[archs4_transcript]}
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
                    gtex_transcript != null
                        ?
                        <>
                            <h1 style={{ textAlign: 'center' }}>{props.transcript}</h1>
                            <GeneAndGraphDescription NCBI_data={NCBI_data} gene={props.transcript} transcript={transcript} database={GTEx_transcriptomics_link} database_desc={GTEx_transcriptomics_desc_d} data={gtex_transcript}/>
                            <div style={{ height: '1500px' }}>
                                <Plot
                                    data={[gtex_transcript]}
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
                                    id={"gtex_transcript"}
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