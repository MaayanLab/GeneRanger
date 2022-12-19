import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/Main.module.css';
import { FormGroup, FormControlLabel, Switch, Autocomplete, TextField, Container, Tooltip, tooltipClasses, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Footer from '../../components/footer';
import Header from '../../components/header';
import Head from '../../components/head';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import GraphMissing from '../../components/graphMissing';
import GeneAndGraphDescription from '../../components/geneAndGraphDescription';
import Zoom from '@mui/material/Zoom';
import Backdrop from '@mui/material/Backdrop';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import prisma from '../../prisma/prisma';
import useSWRImmutable from 'swr/immutable';

const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});

export async function getServerSideProps(context) {

    if (context.query.database == undefined || context.query.database == '') {
        return {
            redirect: {
                destination: '/gene/' + context.query.gene +'?database=ARCHS4',
                permanent: false,
            }
        }
    }

    let gene_desc = await prisma.$queryRaw`select * from gene_info where gene_info.symbol = ${context.query.gene}`
    if (gene_desc.length != 0) {
        gene_desc = gene_desc[0].summary;
        if (gene_desc.indexOf('[') != -1) {
            gene_desc = gene_desc.substring(0, gene_desc.lastIndexOf('[') - 1)
        }
        if (context.query.gene == 'GUCA1A' && gene_desc.indexOf('provided') != -1) {
            gene_desc = gene_desc.substring(0, gene_desc.indexOf('provided') - 1)
        }
        if (gene_desc == 'nan') {
            gene_desc = "No gene description available."
        }
        if (gene_desc != '' && gene_desc.slice(-1) != '.') {
            gene_desc = gene_desc + '.';
        }
    } else {
        gene_desc = "No gene description available."
    }

    let all_db_data = await prisma.$queryRaw
    `
        select d.dbname, d.values as df
        from data_complete d
        where d.gene = ${context.query.gene};
    `

    let sorted_data = {};

    for (let i in all_db_data) {
        let db = all_db_data[i].dbname;
        let df = all_db_data[i].df;
        if (db == 'GTEx_transcriptomics' || db == 'ARCHS4' || db == 'Tabula_Sapiens' || db == 'GTEx_proteomics') {
            const descriptions = Object.keys(df.mean);
            descriptions.sort((a, b) => df.mean[a] - df.mean[b]);
            let names = descriptions;
            const q1 = descriptions.map(description => df.q1[description] || null);
            const median = descriptions.map(description => df.median[description] || null);
            const q3 = descriptions.map(description => df.q3[description] || null);
            const mean = descriptions.map(description => df.mean[description] || null);
            const std = descriptions.map(description => df.std[description] || null);
            const upperfence = descriptions.map(description => df.upperfence[description] || null);
            const lowerfence = descriptions.map(description => df.lowerfence[description] || null);

            // Dealing with dashes and underscores in the names
            if (db == 'ARCHS4') {
                names = names.map(name => name.replace('-', ' - '));
            }
            if (db == 'Tabula_Sapiens') {
                names = names.map(name => name.replace(/_+/g, ' ').replace('-', ' - '));
            }
    
            let data;

            if (db == 'ARCHS4') {
                data = {
                    q1: q1,
                    median: median,
                    q3: q3,
                    mean: mean,
                    lowerfence: lowerfence,
                    upperfence: upperfence,
                    y: names,
                    orientation: 'h',
                    type: 'box'
                }
            } else {
                data = {
                    q1: q1,
                    median: median,
                    q3: q3,
                    mean: mean,
                    sd: std,
                    lowerfence: lowerfence,
                    upperfence: upperfence,
                    y: names,
                    orientation: 'h',
                    type: 'box'
                }
            }
            

            Object.assign(sorted_data, {[db]: data});

        } else if (db == 'HPM' || db == 'HPA' || db == 'CCLE_transcriptomics' || db == 'CCLE_proteomics') {
            let descriptions = Object.keys(df.value);
            if (db == 'HPA') {
                const qualitative_map = {'Not detected': 0, 'Low': 1, 'Medium': 2, 'High': 3}
                descriptions.sort((a, b) => qualitative_map[df.value[a]] - qualitative_map[df.value[b]]);
            } else {
                descriptions.sort((a, b) => df.value[a] - df.value[b]);
            }  

            const levels = descriptions.map(description => df.value[description]);

            if (db == 'HPA') {
                descriptions = descriptions.map(description => description.replace('\n', '<br>'));
            }

            const names = descriptions;

            let data = {
                x: levels,
                y: names,
                type: "scatter",
                mode: "markers",
                marker: { color: '#1f77b4' },
            }
            
            Object.assign(sorted_data, {[db]: data});

        }
    }

    const databases = new Map([
        ['ARCHS4', 0],
        ['GTEx_transcriptomics', 1],
        ['Tabula_Sapiens', 2],
        ['CCLE_transcriptomics', 3],
        ['HPM', 4],
        ['HPA', 5],
        ['GTEx_proteomics', 6],
        ['CCLE_proteomics', 7],
    ]);

    return { 
        props: {
            gene: context.query.gene,
            database: databases.get(context.query.database), 
            sorted_data: sorted_data,
            NCBI_data: gene_desc
        }
    }

}

async function doAutocomplete(input) {
    let res = await fetch(`${process.env.NEXT_PUBLIC_ENTRYPOINT||''}/api/gene_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input })
    })
    let json = await res.json();
    return json;
}

export default function Page(props) {

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

    let ARCHS4_str_m = ', developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
    let GTEx_transcriptomics_str_m = ' provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';
    let Tabula_Sapiens_str_m = ' is a gene expression atlas created from single cell RNA-seq data collected from multiple tissues of 16 postmortem donors. The processed data contains average expression of each human gene in 486 cell types.';
    let CCLE_transcriptomics_str_m = ' transcriptomics dataset contains gene expression data collected with RNA-seq from over 1000 human pan-cancer cell lines.';
    let HPM_str_m = ' contains data from LC-MS/MS proteomics profiling protein expression in 30 human tissues collected from 17 adult postmortem donors.';
    let HPA_str_m = ' contains protein expression data from 44 normal human tissues derived from antibody-based protein profiling using immunohistochemistry.';
    let GTEx_proteomics_str_m = ' dataset has relative protein levels for more than 12,000 proteins across 32 normal human tissues. The data was collected using tandem mass tag (TMT) proteomics to profile tissues collected from 14 postmortem donors.';
    let CCLE_proteomics_str_m = ' proteomics dataset contains protein expression in 375 pan-cancer cell lines. Data was collected by quantitative multiplex mass spectrometry proteomics.';

    let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>
    let Tabula_Sapiens_links = <><a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_transcriptomics_links = <><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPM_links = <><a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPA_links = <><a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_proteomics_links = <><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_proteomics_links = <><a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">citation</a></>

    let ARCHS4_desc = <>{ARCHS4_link}{ARCHS4_str_m} <span style={{whiteSpace: 'nowrap'}}>{ARCHS4_links}</span></>;
    let GTEx_transcriptomics_desc = <>{GTEx_transcriptomics_link}{GTEx_transcriptomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{GTEx_transcriptomics_links}</span></>;
    let Tabula_Sapiens_desc = <>{Tabula_Sapiens_link}{Tabula_Sapiens_str_m} <span style={{whiteSpace: 'nowrap'}}>{Tabula_Sapiens_links}</span></>;
    let CCLE_transcriptomics_desc = <>The {CCLE_transcriptomics_link}{CCLE_transcriptomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{CCLE_transcriptomics_links}</span></>;
    let HPM_desc = <>The {HPM_link}{HPM_str_m} <span style={{whiteSpace: 'nowrap'}}>{HPM_links}</span></>;
    let HPA_desc = <>The {HPA_link}{HPA_str_m} <span style={{whiteSpace: 'nowrap'}}>{HPA_links}</span></>;
    let GTEx_proteomics_desc = <>The {GTEx_proteomics_link}{GTEx_proteomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{GTEx_proteomics_links}</span></>;
    let CCLE_proteomics_desc = <>The {CCLE_proteomics_link}{CCLE_proteomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{CCLE_proteomics_links}</span></>;

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

    let gtex_transcriptomics = null, archs4 = null, tabula_sapiens = null, hpm = null, hpa = null, gtex_proteomics = null, ccle_transcriptomics = null, ccle_proteomics = null;
    let hpa_length = 0, gtex_proteomics_length = 0, ccle_transcriptomics_length = 0, ccle_proteomics_length = 0;

    if ('GTEx_transcriptomics' in props.sorted_data) {
        gtex_transcriptomics = props.sorted_data.GTEx_transcriptomics;
    }
    if ('ARCHS4' in props.sorted_data) {
        archs4 = props.sorted_data.ARCHS4;
    } 
    if ('Tabula_Sapiens' in props.sorted_data) {
        tabula_sapiens = props.sorted_data.Tabula_Sapiens;
    } 
    if ('HPM' in props.sorted_data) {
        hpm = props.sorted_data.HPM;
    } 
    if ('HPA' in props.sorted_data) {
        hpa = props.sorted_data.HPA;
        hpa_length = Object.keys(hpa.y).length;
    } 
    if ('GTEx_proteomics' in props.sorted_data) {
        gtex_proteomics = props.sorted_data.GTEx_proteomics;
        gtex_proteomics_length = Object.keys(gtex_proteomics.y).length;
    }
    if ('CCLE_transcriptomics' in props.sorted_data) {
        ccle_transcriptomics = props.sorted_data.CCLE_transcriptomics;
        ccle_transcriptomics_length = Object.keys(ccle_transcriptomics.y).length;
    }
    if ('CCLE_proteomics' in props.sorted_data) {
        ccle_proteomics = props.sorted_data.CCLE_proteomics;
        ccle_proteomics_length = Object.keys(ccle_proteomics.y).length;
    }

    const router = useRouter();

    const databases = new Map([
        [0, 'ARCHS4'],
        [1, 'GTEx_transcriptomics'],
        [2, 'Tabula_Sapiens'],
        [3, 'CCLE_transcriptomics'],
        [4, 'HPM'],
        [5, 'HPA'],
        [6, 'GTEx_proteomics'],
        [7, 'CCLE_proteomics'],
    ]);

    const [input, setInput] = useState('');
    const  { data } = useSWRImmutable(input, doAutocomplete)
    const geneList = data || []

    // Function for submitting data to the next page
    function submitGene (gene) {
        
        if (gene != null) {
            setInput('');
            setLoading(true);
            let href = {
                pathname: "[gene]",
                query: {
                    gene: gene,
                    database: databases.get(database)
            }};
            router.push(href).then(() => {
                setLoading(false);    
            })
            
        }
        
    }

    function updateURL(db) {
        let href = {
            pathname: "[gene]",
            query: {
                gene: props.gene,
                database: databases.get(db)
        }};
        router.push(href, undefined, { shallow: true, scroll: false } );
    }

    // For MUI tabs

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

    // Used to keep track of which database's info should be displayed
    const [database, setDatabase] = React.useState(parseInt(props.database));

    // For MUI tooltip

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: '#8eaabe',
          width: 75,
          border: '2px solid black',
        },
        [`& .${tooltipClasses.arrow}`]: {
            color: 'black',
        }
    }));

    // For MUI loading icon

    const [loading, setLoading] = React.useState(false);

    // For MUI Drawer

    const [drawerState, setDrawerState] = React.useState(false);
    
    const toggleDrawer = (open) => (event) => {
        setDrawerState(open);
    };
    
    const drawerContents = (
        <Box
            sx={{ width: '375px', height: '100%' }}
            // onClick={toggleDrawer(false)}
            // onKeyDown={toggleDrawer(false)}
            className={styles.drawer}
        >       
            <div style={{width: '400px', display: 'flex', flexDirection: 'column', gap: '20px'}}>

                <div>
                    <Button onClick={toggleDrawer(false)}><MenuIcon style={{transform: 'scale(2)', position: 'absolute', top: '5px', left: '-140px'}} /></Button>
                    <h3 style={{margin: '0'}}>Transcriptomics</h3>
                    <FormGroup style={{alignItems: 'center'}}>

                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(0); updateURL(0)}} checked={database == 0} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="archs4 Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{ARCHS4_desc}</div>

                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(1); updateURL(1)}} checked={database == 1}/>} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>

                        <div className={styles.logoDesc}>{GTEx_transcriptomics_desc}</div>

                        
                        
                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(2); updateURL(2)}} checked={database == 2} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{borderRadius: '8px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} alt="Tabula Sapiens Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{Tabula_Sapiens_desc}</div>

                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(3); updateURL(3)}} checked={database == 3} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{borderRadius: '3px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} alt="CCLE Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{CCLE_transcriptomics_desc}</div>

                    </FormGroup>
                </div>
            
                <div>
                    <h3 style={{margin: '0'}}>Proteomics</h3>
                    <FormGroup style={{alignItems: 'center'}}>

                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(4); updateURL(4)}} checked={database == 4} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{width: '200px', marginRight: '0'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} alt="HPM Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{HPM_desc}</div>
                        
                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(5); updateURL(5)}} checked={database == 5} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{width: '200px', padding: '10px', marginLeft: '0px', marginRight: '-20px', backgroundColor: '#8eaabe', borderRadius: '5px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} alt="HPA Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{HPA_desc}</div>
                        
                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(6); updateURL(6)}} checked={database == 6} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} alt="GTEx Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{GTEx_proteomics_desc}</div>

                        <FormControlLabel 
                        className={styles.formItem} 
                        control={<Switch onChange={() => {setDatabase(7); updateURL(7)}} checked={database == 7} />} 
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{borderRadius: '3px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} alt="CCLE Logo"/>
                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://gygi.hms.harvard.edu" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info'/></IconButton>
                                </HtmlTooltip>
                            </div>
                        } 
                        labelPlacement="start"/>
                        
                        <div className={styles.logoDesc}>{CCLE_proteomics_desc}</div>
                    </FormGroup>
                </div>
                
            </div>
        </Box>
    );

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress size="10rem"/>
            </Backdrop>

            <div className={styles.mainDiv}>

                <Header/>

                <div className={styles.mainFlexbox}>

                    <div className={styles.drawerButtonDiv}>
                        <Button onClick={toggleDrawer(true)}><MenuIcon style={{transform: 'scale(2)'}} /></Button>
                        <Drawer
                            anchor={'left'}
                            open={drawerState}
                            onClose={toggleDrawer(false)}
                        >
                            {drawerContents}
                        </Drawer>
                    </div>

                    <div className={styles.upArrowButton}>
                        <Tooltip title="Return to Top" placement="left">
                            <IconButton onClick={() => {window.scrollTo({top: 0, behavior: 'smooth'})}} color="primary"> <ArrowUpwardIcon style={{transform: 'scale(2)'}}/></IconButton>
                        </Tooltip>
                    </div>

                    <div className={styles.dbGroup}>
                        <div style={{marginBottom: '15px'}}>
                            <Autocomplete
                                disablePortal
                                disableClearable
                                value={''}
                                options={ geneList }
                                sx={{ width: 400 }}
                                inputValue={input}
                                onInputChange={(event, value, reason) => {
                                    if (reason == 'input') {
                                        setInput(value);
                                    }
                                }}
                                onChange={(event, value) => {submitGene(value)}}
                                renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
                                />

                        </div>
                        <div className={styles.dbMenu}>

                            <div>
                              <h3 style={{margin: '0'}}>Transcriptomics</h3>
                              <FormGroup style={{alignItems: 'center'}}>

                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(0); updateURL(0)}} checked={database == 0} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="archs4 Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{ARCHS4_desc}</div>

                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(1); updateURL(1)}} checked={database == 1}/>} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>

                                    <div className={styles.logoDesc}>{GTEx_transcriptomics_desc}</div>

                                    
                                    
                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(2); updateURL(2)}} checked={database == 2} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{borderRadius: '8px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} alt="Tabula Sapiens Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{Tabula_Sapiens_desc}</div>

                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(3); updateURL(3)}} checked={database == 3} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{borderRadius: '3px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} alt="CCLE Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{CCLE_transcriptomics_desc}</div>

                                </FormGroup>
                            </div>
                        
                            <div>
                                <h3 style={{margin: '0'}}>Proteomics</h3>
                                <FormGroup style={{alignItems: 'center'}}>

                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(4); updateURL(4)}} checked={database == 4} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{width: '200px', marginRight: '0'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} alt="HPM Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{HPM_desc}</div>
                                    
                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(5); updateURL(5)}} checked={database == 5} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{width: '200px', padding: '10px', marginLeft: '0px', marginRight: '-20px', backgroundColor: '#8eaabe', borderRadius: '5px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} alt="HPA Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{HPA_desc}</div>
                                    
                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(6); updateURL(6)}} checked={database == 6} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} alt="GTEx Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{GTEx_proteomics_desc}</div>

                                    <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => {setDatabase(7); updateURL(7)}} checked={database == 7} />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{borderRadius: '3px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} alt="CCLE Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://gygi.hms.harvard.edu" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                    
                                    <div className={styles.logoDesc}>{CCLE_proteomics_desc}</div>
                                </FormGroup>
                            </div>
                            
                        </div>
                    </div>
                    <div className={styles.graphFlexbox}>
                        
                        <div className={styles.secondAutocomplete} style={{marginTop: '15px'}}>
                        <Autocomplete
                                disablePortal
                                disableClearable
                                value={''}
                                options={ geneList }
                                sx={{ width: 250 }}
                                inputValue={input}
                                onInputChange={(event, value, reason) => {
                                    if (reason == 'input') {
                                        setInput(value);
                                    }
                                }}
                                onChange={(event, value) => {submitGene(value)}}
                                renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
                                />

                        </div>

                        <div style={{width: '100%'}}>
                            <Box sx={{ width: '100%' }}>
                                <Box className={styles.tabsBox}>
                                    <Tabs value={database} onChange={(event, newValue) => {setDatabase(newValue); updateURL(newValue)}} aria-label="basic tabs example" variant="fullWidth" centered>
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
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={ARCHS4_link} database_desc={ARCHS4_desc_d}/>
                                                        <div style={{height: '13000px'}}>
                                                            <Plot
                                                                data={[archs4]}
                                                                layout={{title: archs4_title,
                                                                yaxis: {
                                                                automargin: true
                                                                },
                                                                xaxis: {
                                                                    title: {
                                                                    text: 'RNA counts',
                                                                    }
                                                                }}}
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                    
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel style={{width: '100%'}} value={database} index={1}>
                                        {
                                            gtex_transcriptomics != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={GTEx_transcriptomics_link} database_desc={GTEx_transcriptomics_desc_d}/>
                                                        <div style={{height: '1500px'}}>
                                                            <Plot
                                                                data={[gtex_transcriptomics]}
                                                                layout={{title: gtex_transcriptomics_title, yaxis: {automargin: true},
                                                                xaxis: {
                                                                    title: {
                                                                    text: 'RNA counts',
                                                                    }
                                                                }}}
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                                id={"gtex_transcriptomics"}
                                                            />
                                                        </div>
                                                    </>
                                                    
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel value={database} index={2}>
                                        {
                                            tabula_sapiens != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={Tabula_Sapiens_link} database_desc={Tabula_Sapiens_desc_d}/>
                                                        <div style={{height: '13000px'}}>
                                                            <Plot
                                                                data={[tabula_sapiens]}
                                                                layout={{title: tabula_sapiens_title,
                                                                yaxis: {
                                                                automargin: true
                                                                },
                                                                xaxis: {
                                                                    title: {
                                                                    text: 'RNA counts',
                                                                    }
                                                                }}}
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                    
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel value={database} index={3}>
                                        {
                                            ccle_transcriptomics != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={CCLE_transcriptomics_link} database_desc={CCLE_transcriptomics_desc_d}/>
                                                        <div style={{height: '50000px'}}>
                                                            <Plot
                                                                data={[ccle_transcriptomics]}
                                                                layout={{title: ccle_transcriptomics_title,
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
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel value={database} index={4}>
                                        {
                                            hpm != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={HPM_link} database_desc={HPM_desc_d}/>
                                                        <div style={{height: '1000px'}}>
                                                            <Plot
                                                                data={[hpm]}
                                                                layout={{title: hpm_title,
                                                                yaxis: {
                                                                automargin: true
                                                                },
                                                                xaxis: {
                                                                    title: {
                                                                    text: 'Average Spectral Counts',
                                                                    }
                                                                }
                                                                }}
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel value={database} index={5}>
                                        {
                                            hpa != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={HPA_link} database_desc={HPA_desc_d}/>
                                                        <div style={{height: '4500px'}}>
                                                            <Plot
                                                                data={[hpa]}
                                                                layout={{title: hpa_title,
                                                                yaxis: {
                                                                    automargin: true,
                                                                    range: [-0.5, hpa_length]
                                                                },
                                                                xaxis: {
                                                                    "categoryorder": "array",
                                                                    "categoryarray":  ["Not detected", "Low", "Medium", "High"],
                                                                    title: {
                                                                        text: 'Tissue Expression Level',
                                                                    }
                                                                }
                                                                }}
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel value={database} index={6}>
                                        {
                                            gtex_proteomics != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={GTEx_proteomics_link} database_desc={GTEx_proteomics_desc_d}/>
                                                        <div style={{height: (gtex_proteomics_length * 50).toString() + 'px'}}>
                                                            <Plot
                                                                data={[gtex_proteomics]}
                                                                layout={{title: gtex_proteomics_title,
                                                                showlegend: false,
                                                                yaxis: {
                                                                automargin: true
                                                                },
                                                                xaxis: {
                                                                    title: {
                                                                    text: 'log2(relative abundance)',
                                                                    }
                                                                }}}
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                                    <TabPanel value={database} index={7}>
                                        {
                                            ccle_proteomics != null 
                                                ? 
                                                    <>
                                                        <h1 style={{textAlign: 'center'}}>{props.gene}</h1>
                                                        <GeneAndGraphDescription NCBI_data={props.NCBI_data} gene={props.gene} database={CCLE_proteomics_link} database_desc={CCLE_proteomics_desc_d}/>
                                                        <div style={{height: (ccle_proteomics_length * 25).toString() + 'px'}}>
                                                            <Plot
                                                                data={[ccle_proteomics]}
                                                                layout={{title: ccle_proteomics_title,
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
                                                                style={{width: '100%', height: '100%'}}
                                                                config={{responsive: true}}
                                                            />
                                                        </div>
                                                    </>
                                                : 
                                                    <GraphMissing/>
                                        }
                                    </TabPanel>
                            </Box>
                        </div>
                    </div>
                </div>
            
                <Footer/>

            </div>
        </div>
      
    )
  }

