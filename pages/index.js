import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../styles/Home.module.css'
import { FormGroup, FormControlLabel, Switch, TextField, Button, Autocomplete } from '@mui/material';
// import genes from './api/genes.json'

// console.log(genes)

const genes = ["BRI3", "CTTN", "UTP14C", "UTP18", "FZD10", "GFRA1", "RCVRN", "GAS2L2", "MMP24OS", "OR1I1", "LPIN1", "TMEM216", "FAM107B", "SCAI", "STAB2", "C3orf70", "C1QB", "MTMR2", "LARGE2", "ARL17A", "AP5S1", "PKP1", "SIPA1L3", "S100A11"];

export default function Home() {

  const [gene, setGene] = useState('A2M');
  const [databases, setDatabases] = useState([true, true, true, true, true, true, true])

  function updateDatabases(index) {
    let updatedArray = [...databases];
    updatedArray[index] = !updatedArray[index];
    setDatabases(updatedArray);
  }

  return (
    <div>
      <Head>
        <title>Single Gene Expression Dashboard</title>
        {/* <link rel="icon" type="image/x-icon" href="/favicon.ico" /> */}
      </Head>

      <div className={styles.mainDiv}>

      <div className={styles.title}>
        <Image src="/images/logo.png" alt="Logo" width={72} height={16} />
        <h1 className={styles.header}>Gene and Protein Expression across Human Cells and Tissues</h1>
      </div>
      
      <div className={styles.text}>This web app takes the input of a human gene and displays its expression across human cells and tissues utilizing a variety of processed datasets from healthy tissues. If the gene is not contained in one of the datasets, a plot will not be produced for that resource.</div>

    <div>
      <Autocomplete
          disablePortal
          options={ genes }
          sx={{ width: 300 }}
          onChange={(event, value) => setGene(value)}
          renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
        />
    </div>
      

      <h2>Select Datasets</h2>

      <FormGroup className={styles.form}>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(0)} defaultChecked />} label="Include GTEX - gene?" labelPlacement="start"/>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(1)} defaultChecked />} label="Include ARCHS4 - Tissue?" labelPlacement="start"/>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(2)} defaultChecked />} label="Include ARCHS4 - Tissue &amp; Cell Type?" labelPlacement="start"/>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(3)} defaultChecked />} label="Include Tabula Sapiens?" labelPlacement="start"/>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(4)} defaultChecked />} label="Include HPM?" labelPlacement="start"/>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(5)} defaultChecked />} label="Include HPA?" labelPlacement="start"/>
        <FormControlLabel control={<Switch onChange={() => updateDatabases(6)} defaultChecked />} label="Include GTEx - Proteomics?" labelPlacement="start"/>
      </FormGroup>

      <div style={{textAlign: 'center'}}>
        <Link 
          href={{
            pathname: "gene/[gene]",
            query: {
                gene: gene,
                databases: databases
          }}}>
          <Button variant="contained">Submit</Button>
        </Link>
      </div>

      
        
      </div>
    </div>
  )
}
