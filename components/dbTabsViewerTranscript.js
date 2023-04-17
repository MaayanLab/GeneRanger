
import { Box } from "@mui/system";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GeneAndGraphDescription from './geneAndGraphDescription';
import GraphMissing from './graphMissing';
import styles from '../styles/Main.module.css';
import PropTypes from 'prop-types';
import { Container} from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from "react";
import { useRuntimeConfig } from "./runtimeConfig";
import PlotOrientation from "./plotOrientation";


const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});


export default function DbTabsViewerTrancript(props) {
    const runtimeConfig = useRuntimeConfig()
    var database = props.database
    var setDatabase = props.setdatabase
    var result = props.sorted_data
    var transcript = props.transcript
    var gene = props.gene
    var NCBI_data = props.NCBI_data

    const [horizontal, setHorizontal] = useState(true);



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
    let gtex_transcript_names_x = [], gtex_transcript_names_y = [], archs4_transcript_names_x = [], archs4_transcript_names_y = [];
    if ('GTEx_transcript' in result) {
        gtex_transcript = result.GTEx_transcript;
        gtex_transcript_names_x = {"x": gtex_transcript.names.slice().reverse(), orientation: 'v'}
        gtex_transcript_names_y = {"y": gtex_transcript.names, orientation: 'h'}
    }
    if ('ARCHS4_transcript' in result) {
        archs4_transcript = result.ARCHS4_transcript;
        archs4_transcript_names_x = {"x": archs4_transcript.names.slice().reverse(), orientation: 'v'}
        archs4_transcript_names_y = {"y": archs4_transcript.names, orientation: 'h'}
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
    <div style={{ width: '100%' }}>
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
                            <GeneAndGraphDescription NCBI_data={NCBI_data} transcript={transcript} gene={gene} database={ARCHS4_link} database_desc={ARCHS4_desc_d} data={archs4_transcript} horizontal={horizontal} setHorizontal={setHorizontal}/>
                            <PlotOrientation data={archs4_transcript} labels_x={archs4_transcript_names_x} labels_y={archs4_transcript_names_y} title={archs4_title} text={'RNA Counts'} horizontal={horizontal}></PlotOrientation>
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
                            <GeneAndGraphDescription NCBI_data={NCBI_data} gene={gene} transcript={transcript} database={GTEx_transcriptomics_link} database_desc={GTEx_transcriptomics_desc_d} data={gtex_transcript} horizontal={horizontal} setHorizontal={setHorizontal}a/>
                            <PlotOrientation data={gtex_transcript} labels_x={gtex_transcript_names_x} labels_y={gtex_transcript_names_y} title={gtex_transcriptomics_title} text={'RNA Counts'} horizontal={horizontal}></PlotOrientation>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
        </Box>
    </div>
    );
}