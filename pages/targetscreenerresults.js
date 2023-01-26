import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import { Autocomplete, TextField, Button } from '@mui/material';
import TargetResultTable from '../components/targetResultsTable';
import DbTabsViewer from '../components/dbTabsViewer';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useRouter } from 'next/router';




export default function Results() {
  // Recieve results and relevant gene stats from user submission
  const router = useRouter()
  const string_res = router.query['res']
  const string_stats = router.query['ogfile']

  // Try to display results --> on reload direct them back to the Target Screener page
  try {
    // Get results list of differentially expressed genes and create array for autocomplete
    const results = JSON.parse(string_res)
    const geneList = results.map(x => x.gene)


    // Set state of membrane gene filter based on submission page
    const [membraneGenes, setMembraneGenes] = React.useState(JSON.parse(router.query['membraneGenes']));

    // Setup possible filters
    const filtMembranes = {items: [{ columnField: "membrane", operatorValue: "=", value: "1" }]};
    const filtEmpty = { items: [{ columnField: "t", operatorValue: ">", value: "0" }] }


    // Use membraneGene state to determine filter
    var initFilt;
    if (membraneGenes) {
      initFilt = filtMembranes
    } else {
      initFilt = filtEmpty
    }

    const [filt, setFilt] = useState(initFilt)
    const [gene, setGene] = useState(geneList[0])
    const [database, setDatabase] = useState(0)
    const [tabsData, setTabsData] = useState({ sorted_data: {}, NCBI_data: '' })

    useEffect(() => {
      // fetch data for given gene
      const fetchData = async () => {
        let res = await fetch(`${process.env.NEXT_PUBLIC_ENTRYPOINT || ''}/api/get_gene_info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'gene': gene })
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

      <div style={{ position: 'relative', minHeight: '100vh' }}>

        <Head />

        <div className={styles.mainDiv}>

          <Header />
          <div className={styles.textDiv}>
            <h2>Target Screener Results</h2>
            <p>This pipeline uses RNA-seq expression data for a tumor and identifies over-expressed proteins verses a baseline dataset of normal tissues such those in GTEx or ARCHS4. It then prioritizes candidates by significance and targetability.</p>
          </div>

          <div className={styles.horizontalFlexbox}>
            <div style={{ width: '250px' }}>Prioritize membrane genes:</div>
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
                }
              }}
            >
              <ToggleButton value={true}>YES</ToggleButton>
              <ToggleButton value={false}>NO</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <TargetResultTable results={string_res} membraneGenes={membraneGenes} filt={filt} setFilt={setFilt} setgene={setGene} />
          <div className={styles.textDiv}>
            <p>Visualize genes identified in the table above across databses either by selecting the desired row or searching for the gene below:</p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <Autocomplete
              disablePortal
              disableClearable
              freeSolo={false}
              value={''}
              options={geneList}
              sx={{ width: 400 }}
              onChange={(event, value) => { setGene(value) }}
              renderInput={(params) => <TextField {...params} label="Gene Symbol" />}
            />

          </div>
          <DbTabsViewer gene={gene} database={database} setdatabase={setDatabase} result={tabsData} geneStats={string_stats} />
          <Footer />
        </div>
      </div>
    )
  } catch {
    return (
      <>
        <div style={{ position: 'relative', minHeight: '100vh' }}>

          <Head />

          <div className={styles.mainDiv}>
            <Header />
            <p>Error: No results found</p>
            <p>Please try resubmitting your data</p>
            <Button variant="contained" color="primary" href="targetscreener">Target Screener</Button>
            <Footer />
          </div>
        </div>
      </>
    )
  }
}