import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Main.module.css';
import { ToggleButtonGroup, ToggleButton, FormGroup, FormControlLabel, Switch, Autocomplete, TextField, Container, Tooltip, tooltipClasses, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import DbTabsViewer from '../../components/dbTabsViewer'
import Box from '@mui/material/Box';
import Footer from '../../components/footer';
import Header from '../../components/header';
import Head from '../../components/head';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Zoom from '@mui/material/Zoom';
import Backdrop from '@mui/material/Backdrop';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import prisma from '../../prisma/prisma';
import useSWRImmutable from 'swr/immutable';
import { useRuntimeConfig } from '../../components/runtimeConfig';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

function sortData(all_db_data) {
    let sorted_data = {};
    let db_list = all_db_data.map(db => db.dbname)
    for (let i in all_db_data) {
        let db = all_db_data[i].dbname;
        let df = all_db_data[i].df;
        if (db == 'GTEx_transcriptomics' || db == 'HuBMAP' || db == 'ARCHS4' || db == 'ARCHS4_norm' || db == 'Tabula_Sapiens' || db == 'GTEx_proteomics') {
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
            if (db == 'ARCHS4' ||  db == 'ARCHS4_norm') {
                names = names.map(name => name.replace('-', ' - '));
            }
            if (db == 'Tabula_Sapiens') {
                names = names.map(name => name.replace(/_+/g, ' ').replace('-', ' - '));
            }

            let data;

            if (db == 'ARCHS4' || db == 'ARCHS4_norm') {
                data = {
                    q1: q1,
                    median: median,
                    q3: q3,
                    mean: mean,
                    lowerfence: lowerfence,
                    upperfence: upperfence,
                    names: names,
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
                    names: names,
                    orientation: 'h',
                    type: 'box'
                }
            }

            Object.assign(sorted_data, { [db]: data });

        } else if (db == 'HPM' || db == 'HPA' || db == 'CCLE_transcriptomics' || db == 'CCLE_proteomics') {
            let descriptions = Object.keys(df.value);
            if (db == 'HPA') {
                const qualitative_map = { 'Not detected': 0, 'Low': 1, 'Medium': 2, 'High': 3 }
                descriptions.sort((a, b) => qualitative_map[df.value[a]] - qualitative_map[df.value[b]]);
            } else {
                descriptions.sort((a, b) => df.value[a] - df.value[b]);
            }

            const levels = descriptions.map(description => df.value[description]);

            if (db == 'HPA') {
                descriptions = descriptions.map(description => description.replace('\n', ' '));
            }

            const names = descriptions;

            let data = {
                values: levels,
                names: names,
                type: "scatter",
                mode: "markers",
                marker: { color: '#1f77b4' },
            }
            Object.assign(sorted_data, { [db]: data });

        }
    }
    return sorted_data
}


export async function getServerSideProps(context) {

    if (context.query.database == undefined || context.query.database == '') {
        return {
            redirect: {
                destination: '/gene/' + context.query.gene + '?database=ARCHS4',
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

    let mappings = await prisma.$queryRaw
        `
        select 
            mapper.transcript
        from
            mapper
        where mapper.gene = ${context.query.gene};
    `

    let all_db_data = await prisma.$queryRaw
        `
        select d.dbname, d.values as df
        from data_complete d
        where d.gene = ${context.query.gene};
    `
    let joint_db_data = await prisma.$queryRaw
        `
        select dbname, df
        from jsonb_each(unified_data_complete(${context.query.gene}, '{"GTEx_proteomics", "GTEx_transcriptomics"}'::varchar[])) as d(dbname, df);
    `

    let sorted_data = sortData(all_db_data)
    Object.assign( sorted_data, { GTEx: sortData(joint_db_data) })

    const databases = new Map([
        ['ARCHS4', 0],
        ['GTEx_transcriptomics', 1],
        ['Tabula_Sapiens', 2],
        ['CCLE_transcriptomics', 3],
        ['HPM', 4],
        ['HPA', 5],
        ['GTEx_proteomics', 6],
        ['CCLE_proteomics', 7],
        ['GTEx', 8],
        ['HuBMAP', 9],
        ['ARCHS4_norm', 10]
    ]);

    return {
        props: {
            gene: context.query.gene,
            database: databases.get(context.query.database),
            sorted_data: sorted_data,
            NCBI_data: gene_desc,
            mappings: mappings
        }
    }
}

function TabPanel(props) {
    const { children, value, index, classes, ...other } = props;
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

const databases = new Map([
    [0, 'ARCHS4'],
    [1, 'GTEx_transcriptomics'],
    [2, 'Tabula_Sapiens'],
    [3, 'CCLE_transcriptomics'],
    [4, 'HPM'],
    [5, 'HPA'],
    [6, 'GTEx_proteomics'],
    [7, 'CCLE_proteomics'],
    [8, 'GTEx'],
    [9, 'HuBMAP'],
    [10, 'ARCHS4_norm']
]);

let ARCHS4_str_m = ', developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
let GTEx_transcriptomics_str_m = ' provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';
let HuBMAP_str_m = 'aims to create a multi-scale spatial atlas of the healthy human body at single-cell resolution by applying advanced technologies and disseminating resources to the community';
let Tabula_Sapiens_str_m = ' is a gene expression atlas created from single cell RNA-seq data collected from multiple tissues of 16 postmortem donors. The processed data contains average expression of each human gene in 486 cell types.';
let CCLE_transcriptomics_str_m = ' transcriptomics dataset contains gene expression data collected with RNA-seq from over 1000 human pan-cancer cell lines.';
let HPM_str_m = ' contains data from LC-MS/MS proteomics profiling protein expression in 30 human tissues collected from 17 adult postmortem donors.';
let HPA_str_m = ' contains protein expression data from 44 normal human tissues derived from antibody-based protein profiling using immunohistochemistry.';
let GTEx_proteomics_str_m = ' dataset has relative protein levels for more than 12,000 proteins across 32 normal human tissues. The data was collected using tandem mass tag (TMT) proteomics to profile tissues collected from 14 postmortem donors.';
let CCLE_proteomics_str_m = ' proteomics dataset contains protein expression in 375 pan-cancer cell lines. Data was collected by quantitative multiplex mass spectrometry proteomics.';
let GTEx_str_m = ' provides an aggregate view of bulk RNA-seq data for 54 human tissues collected from postmortem donors & relative protein levels for more than 12,000 proteins across 32 normal human tissues. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';

let ARCHS4_link = <a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">ARCHS4</a>;
let GTEx_transcriptomics_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">GTEx transcriptomics</a>;
let Tabula_Sapiens_link = <a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">Tabula Sapiens</a>;
let HuBMAP_link =  <a href="https://hubmapconsortium.org/" target="_blank" rel="noopener noreferrer">Human BioMolecular Atlas Program (HubMAP)</a>;
let CCLE_transcriptomics_link = <a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;
let HPM_link = <a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">Human Proteome Map (HPM)</a>;
let HPA_link = <a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">Human Protein Atlas (HPA)</a>;
let GTEx_proteomics_link = <a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">GTEx proteomics</a>;
let CCLE_proteomics_link = <a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;
let GTEx_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;

let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>
let Tabula_Sapiens_links = <><a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">citation</a></>
let HuBMAP_links = <><a href="https://hubmapconsortium.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/31597973/" target="_blank" rel="noopener noreferrer">citation</a></>
let CCLE_transcriptomics_links = <><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">citation</a></>
let HPM_links = <><a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">citation</a></>
let HPA_links = <><a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">citation</a></>
let GTEx_proteomics_links = <><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">citation</a></>
let CCLE_proteomics_links = <><a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">citation</a></>
let GTEx_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>

let ARCHS4_desc = <>{ARCHS4_link}{ARCHS4_str_m} <span style={{ whiteSpace: 'nowrap' }}>{ARCHS4_links}</span></>;
let GTEx_transcriptomics_desc = <>{GTEx_transcriptomics_link}{GTEx_transcriptomics_str_m} <span style={{ whiteSpace: 'nowrap' }}>{GTEx_transcriptomics_links}</span></>;
let Tabula_Sapiens_desc = <>{Tabula_Sapiens_link}{Tabula_Sapiens_str_m} <span style={{ whiteSpace: 'nowrap' }}>{Tabula_Sapiens_links}</span></>;
let HuBMAP_desc = <>{HuBMAP_link}{HuBMAP_str_m} <span style={{ whiteSpace: 'nowrap' }}>{HuBMAP_links}</span></>;
let CCLE_transcriptomics_desc = <>The {CCLE_transcriptomics_link}{CCLE_transcriptomics_str_m} <span style={{ whiteSpace: 'nowrap' }}>{CCLE_transcriptomics_links}</span></>;
let HPM_desc = <>The {HPM_link}{HPM_str_m} <span style={{ whiteSpace: 'nowrap' }}>{HPM_links}</span></>;
let HPA_desc = <>The {HPA_link}{HPA_str_m} <span style={{ whiteSpace: 'nowrap' }}>{HPA_links}</span></>;
let GTEx_proteomics_desc = <>The {GTEx_proteomics_link}{GTEx_proteomics_str_m} <span style={{ whiteSpace: 'nowrap' }}>{GTEx_proteomics_links}</span></>;
let CCLE_proteomics_desc = <>The {CCLE_proteomics_link}{CCLE_proteomics_str_m} <span style={{ whiteSpace: 'nowrap' }}>{CCLE_proteomics_links}</span></>;
let GTEx_desc = <>{GTEx_link}{GTEx_str_m} <span style={{ whiteSpace: 'nowrap' }}>{GTEx_links}</span></>;


export default function Page(props) {
    const runtimeConfig = useRuntimeConfig();

    const [database, setDatabase] = React.useState(parseInt(props.database));

    const [loading, setLoading] = React.useState(false);

    const doAutocomplete = useCallback(async (input) => {
        let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ''}/api/gene_list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input })
        })
        let json = await res.json();
        return json;
    }, [runtimeConfig]);



    const router = useRouter();



    const [input, setInput] = useState('');
    const { data } = useSWRImmutable(input, doAutocomplete)
    const geneList = data || []

    // Function for submitting data to the next page
    const submitGene = useCallback((gene) => {

        if (gene != null) {
            setInput('');
            setLoading(true);
            let href = {
                pathname: "[gene]",
                query: {
                    gene: gene,
                    database: databases.get(database)
                }
            };
            router.push(href).then(() => {
                setLoading(false);
            })

        }

    }, [database, router]);

    const updateURL = useCallback((db) => {
        let href = {
            pathname: "[gene]",
            query: {
                gene: props.gene,
                database: databases.get(db)
            }
        };
        router.push(href, undefined, { shallow: true, scroll: false });
    }, [router, props.gene])

    // For MUI Drawer
    const [drawerState, setDrawerState] = React.useState(false);

    const toggleDrawer = useCallback((open) => (event) => {
        setDrawerState(open);
    }, [setDrawerState]);

    const drawerContents = (
        <Box
            sx={{ width: '375px', height: '100%' }}
            // onClick={toggleDrawer(false)}
            // onKeyDown={toggleDrawer(false)}
            className={styles.drawer}
        >
            <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div>
                    <Button onClick={toggleDrawer(false)}><MenuIcon style={{ transform: 'scale(2)', position: 'absolute', top: '5px', left: '-140px' }} /></Button>
                    <h3 style={{ margin: '0' }}>Transcriptomics</h3>
                    <FormGroup style={{ alignItems: 'center' }}>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(0); updateURL(0) }} checked={database == 0} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="archs4 Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{ARCHS4_desc}</div>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(1); updateURL(1) }} checked={database == 1 || database == 8} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{GTEx_transcriptomics_desc}</div>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(2); updateURL(2) }} checked={database == 2} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} style={{ borderRadius: '8px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} alt="Tabula Sapiens Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{Tabula_Sapiens_desc}</div>



                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(9); updateURL(9) }} checked={database == 9} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} style={{ borderRadius: '8px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/hubmap.png"} alt="HubMAP Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://hubmapconsortium.org/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/31597973/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{HuBMAP_desc}</div>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(3); updateURL(3) }} checked={database == 3} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} style={{ borderRadius: '3px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} alt="CCLE Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{CCLE_transcriptomics_desc}</div>

                    </FormGroup>
                </div>

                <div>
                    <h3 style={{ margin: '0' }}>Proteomics</h3>
                    <FormGroup style={{ alignItems: 'center' }}>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(4); updateURL(4) }} checked={database == 4} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} style={{ width: '200px', marginRight: '0' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} alt="HPM Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{HPM_desc}</div>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(5); updateURL(5) }} checked={database == 5} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} style={{ width: '200px', padding: '10px', marginLeft: '0px', marginRight: '-20px', backgroundColor: '#8eaabe', borderRadius: '5px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} alt="HPA Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{HPA_desc}</div>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(6); updateURL(6) }} checked={database == 6 || database == 8} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} alt="GTEx Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{GTEx_proteomics_desc}</div>

                        <FormControlLabel
                            className={styles.formItem}
                            control={<Switch onChange={() => { setDatabase(7); updateURL(7) }} checked={database == 7} />}
                            label={
                                <div className={styles.dbLogo}>
                                    <img className={styles.databaseLogo} style={{ borderRadius: '3px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} alt="CCLE Logo" />
                                    <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                        <div className={styles.tooltipText}><a href="https://gygi.hms.harvard.edu" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                        <IconButton><InfoIcon color='info' /></IconButton>
                                    </HtmlTooltip>
                                </div>
                            }
                            labelPlacement="start" />

                        <div className={styles.logoDesc}>{CCLE_proteomics_desc}</div>
                    </FormGroup>
                </div>

            </div>
        </Box>
    );

    return (

        <div style={{ position: 'relative', minHeight: '100vh' }}>

            <Head />

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress size="10rem" />
            </Backdrop>

            <div className={styles.mainDiv}>

                <Header />

                <div className={styles.mainFlexbox}>

                    <div className={styles.drawerButtonDiv}>
                        <Button onClick={toggleDrawer(true)}><MenuIcon style={{ transform: 'scale(2)' }} /></Button>
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
                            <IconButton onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }} color="primary"> <ArrowUpwardIcon style={{ transform: 'scale(2)' }} /></IconButton>
                        </Tooltip>
                    </div>

                    <div className={styles.dbGroup}>
                        <ToggleButtonGroup
                            color="secondary"
                            value={true}
                            exclusive
                            sx={{ marginBottom: '10px' }}
                            onChange={(event, newValue) => {
                                if (newValue !== null)
                                    setInput('');
                                setLoading(true);
                                router.push('/transcript/ENST00000000233?database=ARCHS4_transcript').then(() => {
                                    setLoading(false);
                                })
                            }
                            }
                        >
                            <ToggleButton value={true}>Gene</ToggleButton>
                            <ToggleButton value={false}>Transcript</ToggleButton>
                        </ToggleButtonGroup>
                        <div style={{ marginBottom: '15px' }}>
                            <Autocomplete
                                disablePortal
                                disableClearable
                                freeSolo={true}
                                value={''}
                                options={geneList}
                                sx={{ width: 400 }}
                                inputValue={input}
                                onInputChange={(event, value, reason) => {
                                    if (reason == 'input') {
                                        setInput(value);
                                    }
                                }}
                                onChange={(event, value) => { submitGene(value) }}
                                renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
                            />

                        </div>
                        <div className={styles.dbMenu}>

                            <div>
                                <h3 style={{ margin: '0' }}>Transcriptomics</h3>
                                <FormGroup style={{ alignItems: 'center' }}>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(0); updateURL(0) }} checked={database == 0} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="archs4 Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{ARCHS4_desc}</div>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(1); updateURL(1) }} checked={database == 1 || database == 8} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{GTEx_transcriptomics_desc}</div>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(9); updateURL(9) }} checked={database == 9} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} style={{ borderRadius: '8px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/hubmap.png"} alt="HuBMAP Logo" />
                                                <HtmlTooltip enterTouchDelay={0} leaveTouchDelay={3000} arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://hubmapconsortium.org/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/31597973/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{HuBMAP_desc}</div>



                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(2); updateURL(2) }} checked={database == 2} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} style={{ borderRadius: '8px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} alt="Tabula Sapiens Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{Tabula_Sapiens_desc}</div>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(3); updateURL(3) }} checked={database == 3} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} style={{ borderRadius: '3px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} alt="CCLE Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{CCLE_transcriptomics_desc}</div>

                                </FormGroup>
                            </div>

                            <div>
                                <h3 style={{ margin: '0' }}>Proteomics</h3>
                                <FormGroup style={{ alignItems: 'center' }}>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(4); updateURL(4) }} checked={database == 4} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} style={{ width: '200px', marginRight: '0' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} alt="HPM Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{HPM_desc}</div>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(5); updateURL(5) }} checked={database == 5} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} style={{ width: '200px', padding: '10px', marginLeft: '0px', marginRight: '-20px', backgroundColor: '#8eaabe', borderRadius: '5px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} alt="HPA Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{HPA_desc}</div>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(6); updateURL(6) }} checked={database == 6 || database == 8} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} alt="GTEx Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{GTEx_proteomics_desc}</div>

                                    <FormControlLabel
                                        className={styles.formItem}
                                        control={<Switch onChange={() => { setDatabase(7); updateURL(7) }} checked={database == 7} />}
                                        label={
                                            <div className={styles.dbLogo}>
                                                <img className={styles.databaseLogo} style={{ borderRadius: '3px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} alt="CCLE Logo" />
                                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                    <div className={styles.tooltipText}><a href="https://gygi.hms.harvard.edu" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                                    <IconButton><InfoIcon color='info' /></IconButton>
                                                </HtmlTooltip>
                                            </div>
                                        }
                                        labelPlacement="start" />

                                    <div className={styles.logoDesc}>{CCLE_proteomics_desc}</div>
                                </FormGroup>
                            </div>

                        </div>
                    </div>
                    <div className={styles.graphFlexbox}>

                        <div className={styles.secondAutocomplete} style={{ margin: '15px', textAlign: 'center' }}>
                            <ToggleButtonGroup
                                color="secondary"
                                value={true}
                                exclusive
                                sx={{ marginBottom: '10px' }}
                                onChange={(event, newValue) => {
                                    if (newValue !== null)
                                        setInput('');
                                    setLoading(true);
                                    router.push('/transcript/ENST00000000233?database=ARCHS4_transcript').then(() => {
                                        setLoading(false);
                                    })
                                }
                                }
                            >
                                <ToggleButton value={true}>Gene</ToggleButton>
                                <ToggleButton value={false}>Transcript</ToggleButton>
                            </ToggleButtonGroup>
                            <Autocomplete
                                disablePortal
                                disableClearable
                                freeSolo={true}
                                value={''}
                                options={geneList}
                                sx={{ width: 250 }}
                                inputValue={input}
                                onInputChange={(event, value, reason) => {
                                    if (reason == 'input') {
                                        setInput(value);
                                    }
                                }}
                                onChange={(event, value) => { submitGene(value) }}
                                renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
                            />

                        </div>

                        <div style={{ width: '100%' }}>

                            <DbTabsViewer setdatabase={setDatabase} database={database} gene={props.gene} NCBI_data={props.NCBI_data} sorted_data={props.sorted_data} updateurl={updateURL} mappings={props.mappings}></DbTabsViewer>
                        </div>
                    </div>
                </div>

                <Footer />

            </div>
        </div>

    )
}

