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

  const [gene, setGene] = useState();
  const [databases, setDatabases] = useState([true, true, true, true, true, true, true]);

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
        <Image src="/images/logo.png" alt="App Logo" width={72} height={16} />
        <h1 className={styles.header}>Gene and Protein Expression across Human Cells and Tissues</h1>
      </div>
      
      <div className={styles.text}>This web app takes the input of a human gene and displays its expression across human cells and tissues utilizing a variety of processed datasets from healthy tissues. If the gene is not contained in one of the datasets, a plot will not be produced for that resource.</div>

    <div>
      <Autocomplete
          disablePortal
          options={ genes }
          sx={{ width: 300 }}
          onChange={(event, value) => {setGene(value)}}
          renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
        />
    </div>

      <div className={styles.formDiv}>

        <div className={styles.dbGroup}>
          <h2>Gene Expression Datasets</h2>
          <FormGroup>
            <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(0)} defaultChecked />} label={<><Image src="/images/GTEx.png" alt="GTEx Logo" width={'250px'} height={'32px'}/></>} labelPlacement="start"/>
            <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(1)} defaultChecked />} label={<><Image src="/images/archs4.png" alt="archs4 Logo" width={'250px'} height={'32px'}/><div>(Tissue)</div></>} labelPlacement="start"/>
            <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(2)} defaultChecked />} label={<><Image src="/images/archs4.png" alt="archs4 Logo" width={'250px'} height={'32px'}/><div>(Tissue &amp; Cell Type)</div></>} labelPlacement="start"/>
          </FormGroup>
        </div>

        <div className={styles.dbGroup}>
          <h2>Proteomics Datasets</h2>
          <div className={styles.innerFormDiv}>
            <FormGroup className={styles.form}>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(3)} defaultChecked />} label={<><Image src="/images/tabula_sapiens.png" alt="Tabula Sapiens Logo" width={'250px'} height={'250px'}/></>} labelPlacement="start"/>
            </FormGroup>

            <FormGroup>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(4)} defaultChecked />} label={<><Image src="/images/HPM.gif" alt="HPM Logo" width={'250px'} height={'32px'}/></>} labelPlacement="start"/>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(5)} defaultChecked />} label={<><Image src="/images/HPA.svg" alt="HPA Logo" width={'250px'} height={'32px'}/></>} labelPlacement="start"/>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(6)} defaultChecked />} label={<><Image src="/images/GTEx.png" alt="GTEx Logo" width={'250px'} height={'32px'}/></>} labelPlacement="start"/>
            </FormGroup>
          </div>
        </div>  
      </div>

      <div style={{textAlign: 'center'}}>
        {
          (gene != null) && !(databases.every(e => e === false)) ?
            <Link 
            href={{
              pathname: "gene/[gene]",
              query: {
                  gene: gene,
                  databases: databases
            }}}>
            <Button variant="contained" color="primary">Submit</Button>
          </Link>
          :
          <Button variant="contained" color="error">Select options to continue</Button>
        }
        
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <div><a className={styles.link} href="mailto:avi.maayan@mssm.edu">Contact Us</a></div>
          <div><a className={styles.link} href="">Usage License</a></div>
        </div>
        <div>
          <a href="https://icahn.mssm.edu/research/bioinformatics" target="_blank" rel="noopener noreferrer"><Image src="/images/icahn_cb.png" alt="School Logo" width={137} height={80} /></a>
        </div>
        <div>
          <a href="https://labs.icahn.mssm.edu/maayanlab/" target="_blank" rel="noopener noreferrer"><Image style={{borderRadius: '10px'}} src="/images/maayanlab_logo.png" alt="Lab Logo" width={80} height={80} /></a>
        </div>
        <div className={styles.githubButtons}>
          <a className={styles.githubLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><Image style={{borderRadius: '5px'}} src="/images/GitHub-Mark.png" alt="GitHub Logo" width={16} height={16} />&nbsp;View source code</Button></a>
          <a className={styles.githubLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard/issues/new" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><Image style={{borderRadius: '5px'}} src="/images/GitHub-Mark.png" alt="GitHub Logo" width={16} height={16} />&nbsp;Submit an issue</Button></a>
        </div>
      </footer>
        
      </div>
    </div>
  )
}
