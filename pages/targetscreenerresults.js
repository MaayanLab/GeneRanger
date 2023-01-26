import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import { Box } from "@mui/system";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from "next/link";
import PropTypes from 'prop-types';
import TargetResultTable from '../components/targetResultsTable';
import DbTabsViewer from '../components/dbTabsViewer';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useRouter } from 'next/router';




export default function Results() {
    const router = useRouter()
    const string_res = router.query['res']
    const string_stats = router.query['ogfile']

    console.log(router.query)


    const results = JSON.parse(string_res)

    const geneStats = JSON.parse(string_stats)

    console.log(geneStats)

    const [membraneGenes, setMembraneGenes] = React.useState(JSON.parse(router.query['membraneGenes']));

    const filtMembranes = {
      items: [{columnField: "membrane", operatorValue: "=", value: "1"}]
    };

    const filtEmpty = {items: [{columnField: "t", operatorValue: ">", value: "0"}]}

    var initFilt;
    if (membraneGenes) {
      initFilt = filtMembranes
    } else {
      initFilt = filtEmpty
    }

    const [filt, setFilt] = useState(initFilt)
    const [gene, setGene] = useState('CYSLTR1')
    const [database, setDatabase] = useState(0)


    const [tabsData, setTabsData] = useState({sorted_data: {}, NCBI_data: ''})

    

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    let id = -1;

    function getId() {
        id += 1;
        return id
    }



    useEffect(() => {
      // declare the data fetching function
      const fetchData = async () => { 
        let res = await fetch(`${process.env.NEXT_PUBLIC_ENTRYPOINT || ''}/api/get_gene_info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'gene': gene})
        })
        const json = await res.json()
        console.log(json)
        setTabsData(json)
      }
    
      // call the function
      fetchData()
        // make sure to catch any error
        .catch(console.error);
    }, [gene])


    return (
    
    <div style={{position: 'relative', minHeight: '100vh'}}>

        <Head/>

        <div className={styles.mainDiv}>

            <Header/>
            <div className={styles.textDiv}>
              <h2>Target Screener Results</h2>
              <p>This pipeline uses RNA-seq expression data for a tumor and identifies over-expressed proteins verses a baseline dataset of normal tissues such those in GTEx or ARCHS4. It then prioritizes candidates by significance and targetability.</p>
            </div>

            <div className={styles.horizontalFlexbox}>
                <div style={{width: '250px'}}>Prioritize membrane genes:</div>
                <ToggleButtonGroup
                    color="primary"
                    value={membraneGenes}
                    exclusive
                    onChange={(event, newValue) => {
                      if (newValue !== null) {
                        setMembraneGenes(!membraneGenes)
                        if (membraneGenes) {
                          setFilt(filtEmpty)
                        } else setFilt(filtMembranes)
                    }}}
                    >
                    <ToggleButton value={true}>YES</ToggleButton>
                    <ToggleButton value={false}>NO</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <TargetResultTable results={string_res} membraneGenes={membraneGenes} filt={filt} setFilt={setFilt} setgene={setGene} /* select={select} setSelection={setSelection} *//>
            <DbTabsViewer gene={gene} database={database} setdatabase={setDatabase} result={tabsData} geneStats={string_stats}/>
            <Footer/>
        </div>
    </div>
    )
}