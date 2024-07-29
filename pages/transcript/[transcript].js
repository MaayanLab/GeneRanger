import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Main.module.css';
import { FormGroup, FormControlLabel, Switch, Autocomplete, TextField, Container, Tooltip, tooltipClasses, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import DbTabsViewerTrascript from '../../components/dbTabsViewerTranscript';
import Box from '@mui/material/Box';
import Footer from '../../components/footer';
import Header from '../../components/header';
import Head from '../../components/head';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
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




export async function getServerSideProps(context) {

    if (context.query.database == undefined || context.query.database == '') {
        return {
            redirect: {
                destination: '/transcript/' + context.query.transcript + '?database=ARCHS4_transcript',
                permanent: false,
            }
        }
    }
    var gene = '';

    let gene_desc = await prisma.$queryRaw
        `select
            mapper.gene,
            gene_info.*
        from 
            gene_info,
            mapper
        where mapper.transcript = ${context.query.transcript} and gene_info.symbol = mapper.gene
        `
    if (gene_desc.length != 0) {
        gene = gene_desc[0].gene
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
        where d.transcript = ${context.query.transcript};
    `

    let sorted_data = {};

    for (let i in all_db_data) {
        let db = all_db_data[i].dbname;
        let df = all_db_data[i].df;
        if (db == 'GTEx_transcript' || db == 'ARCHS4_transcript') {
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
            if (db == 'ARCHS4_transcript') {
                names = names.map(name => name.replace('-', ' - '));
            }

            let data;

            if (db == 'ARCHS4_transcript') {
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

        }
    }

    const databases = new Map([
        ['ARCHS4_transcript', 0],
        ['GTEx_transcript', 1],
    ]);

    return {
        props: {
            transcript: context.query.transcript,
            gene: gene,
            database: databases.get(context.query.database),
            sorted_data: sorted_data,
            NCBI_data: gene_desc,
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
    [0, 'ARCHS4_transcript'],
    [1, 'GTEx_transcript'],
]);


export default function Page(props) {
    const runtimeConfig = useRuntimeConfig();

    const [database, setDatabase] = React.useState(parseInt(props.database));

    const [loading, setLoading] = React.useState(false);

    const doAutocomplete = useCallback(async (input) => {
        let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ''}/api/transcript_list`, {
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
    const transcriptList = data || []

    // Function for submitting data to the next page
    const submitTranscript = useCallback((transcript) => {

        if (transcript != null) {
            setInput('');
            setLoading(true);
            let href = {
                pathname: "[transcript]",
                query: {
                    transcript: transcript,
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
            pathname: "[transcript]",
            query: {
                transcript: props.transcript,
                database: databases.get(db)
            }
        };
        router.push(href, undefined, { shallow: true, scroll: false });
    }, [router, props.transcript])

    // For MUI Drawer
    const [drawerState, setDrawerState] = React.useState(false);

    const toggleDrawer = useCallback((open) => (event) => {
        setDrawerState(open);
    }, [setDrawerState]);

    let ARCHS4_link = <a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">ARCHS4</a>;
    let GTEx_transcriptomics_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">GTEx transcriptomics</a>;

    let ARCHS4_str_m = ', developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
    let GTEx_transcriptomics_str_m = ' provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';

    let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>


    let ARCHS4_desc = <>{ARCHS4_link}{ARCHS4_str_m} <span style={{whiteSpace: 'nowrap'}}>{ARCHS4_links}</span></>;
    let GTEx_transcriptomics_desc = <>{GTEx_transcriptomics_link}{GTEx_transcriptomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{GTEx_transcriptomics_links}</span></>;

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
                            control={<Switch onChange={() => { setDatabase(1); updateURL(1) }} checked={database == 1} />}
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
                        <div style={{ marginBottom: '15px' }}>
                            <ToggleButtonGroup
                                color="secondary"
                                value={false}
                                exclusive
                                sx={{ marginBottom: '10px'}}
                                onChange={(event, newValue) => {
                                    if (newValue !== null)
                                    setInput('');
                                    setLoading(true);
                                    router.push('/gene/A2M?database=ARCHS4').then(() => {
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
                                options={transcriptList}
                                sx={{ width: 400 }}
                                inputValue={input}
                                onInputChange={(event, value, reason) => {
                                    if (reason == 'input') {
                                        setInput(value);
                                    }
                                }}
                                onChange={(event, value) => { submitTranscript(value) }}
                                renderInput={(params) => <TextField {...params} label="Human Transcript" />}
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
                                        control={<Switch onChange={() => { setDatabase(1); updateURL(1) }} checked={database == 1} />}
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
                                </FormGroup>
                            </div>

                        </div>
                    </div>
                    <div className={styles.graphFlexbox}>

                        <div className={styles.secondAutocomplete} style={{ marginTop: '15px', textAlign: 'center' }}>
                            <ToggleButtonGroup
                                    color="secondary"
                                    value={false}
                                    exclusive
                                    sx={{ marginBottom: '10px'}}
                                    onChange={(event, newValue) => {
                                        if (newValue !== null)
                                        setInput('');
                                        setLoading(true);
                                        router.push('/gene/A2M?database=ARCHS4').then(() => {
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
                                options={transcriptList}
                                sx={{ width: 250 }}
                                inputValue={input}
                                onInputChange={(event, value, reason) => {
                                    if (reason == 'input') {
                                        setInput(value);
                                    }
                                }}
                                onChange={(event, value) => { submitTranscript(value) }}
                                renderInput={(params) => <TextField {...params} label="Human Transcript" />}
                            />

                        </div>

                        <DbTabsViewerTrascript sorted_data={props.sorted_data} database={database} setdatabase={setDatabase} NCBI_data={props.NCBI_data} gene={props.gene} transcript={props.transcript}/>
                    </div>
                    
                </div>

                <Footer />

            </div>
        </div>

    )
}

