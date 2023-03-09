
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useCallback } from 'react';
import styles from '../../styles/Main.module.css';
import { Autocomplete, TextField, Tooltip, tooltipClasses, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router'
import Footer from '../../components/footer';
import Header from '../../components/header';
import Head from '../../components/head';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Backdrop from '@mui/material/Backdrop';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import prisma from '../../prisma/prisma';
import useSWRImmutable from 'swr/immutable';
import { useRuntimeConfig } from '../../components/runtimeConfig';
import TabsViewer from '../../components/tabsViewer';
import SideBar from '../../components/sideBar';
import DrawerButton from '../../components/drawerButton';



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
            Object.assign(sorted_data, {['HuBMAP']: data});

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
        ['HuBMAP', 8],
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


const databases = new Map([
    [0, 'ARCHS4'],
    [1, 'GTEx_transcriptomics'],
    [2, 'Tabula_Sapiens'],
    [3, 'CCLE_transcriptomics'],
    [4, 'HPM'],
    [5, 'HPA'],
    [6, 'GTEx_proteomics'],
    [7, 'CCLE_proteomics'],
    [8, 'HuBMAP'],
]);

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

export default function Page(props) {
    const runtimeConfig = useRuntimeConfig();

    const [database, setDatabase] = React.useState(parseInt(props.database));

    const [loading, setLoading] = React.useState(false);


    const doAutocomplete = useCallback(async (input) => {
        let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT||''}/api/gene_list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input })
        })
        let json = await res.json();
        return json;
    }, [runtimeConfig]);


    let hubmap = null, gtex_transcriptomics = null, archs4 = null, tabula_sapiens = null, hpm = null, hpa = null, gtex_proteomics = null, ccle_transcriptomics = null, ccle_proteomics = null;
    let hpa_length = 0, gtex_proteomics_length = 0, ccle_transcriptomics_length = 0, ccle_proteomics_length = 0;

    if ('GTEx_transcriptomics' in props.sorted_data) {
        gtex_transcriptomics = props.sorted_data.GTEx_transcriptomics;
    }
    if ('HuBMAP' in props.sorted_data) {
        hubmap = props.sorted_data.hubmap;
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

    const [input, setInput] = useState('');
    const  { data } = useSWRImmutable(input, doAutocomplete)
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
            }};
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
        }};
        router.push(href, undefined, { shallow: true, scroll: false } );
    }, [router, props.gene])    


    
    


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

                    <DrawerButton HtmlTooltip={HtmlTooltip}></DrawerButton>

                    <div className={styles.upArrowButton}>
                        <Tooltip title="Return to Top" placement="left">
                            <IconButton onClick={() => {window.scrollTo({top: 0, behavior: 'smooth'})}} color="primary"> <ArrowUpwardIcon style={{transform: 'scale(2)'}}/></IconButton>
                        </Tooltip>
                    </div>

                    <SideBar database={database} setdatabase={setDatabase} updateurl={updateURL} geneList={geneList} input={input} setinput={setInput} HtmlTooltip={HtmlTooltip} submitgene={submitGene}></SideBar>


                    <div className={styles.graphFlexbox}>
                        
                        <div className={styles.secondAutocomplete} style={{marginTop: '15px'}}>
                        <Autocomplete
                                disablePortal
                                disableClearable
                                freeSolo={true}
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
                    </div>
                    <TabsViewer gene={props.gene} NCBI_data={props.NCBI_data} sorted_data={JSON.stringify(props.sorted_data)} database={database} setdatabase={setDatabase}></TabsViewer>
                </div>
            
                <Footer/>

            </div>
        </div>
      
    )
  }

