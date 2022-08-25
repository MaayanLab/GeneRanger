import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../styles/Home.module.css';
import { FormGroup, FormControlLabel, Switch, TextField, Button, Autocomplete } from '@mui/material';
import genes from '../json/genes.json';
import CircularProgress from '@mui/material/CircularProgress';

export default function Home() {

  const [gene, setGene] = useState();
  const [databases, setDatabases] = useState([true, true, true, true, true, true]);
  const [loading, setLoading] = useState(false);

  function updateDatabases(index) {
    let updatedArray = [...databases];
    updatedArray[index] = !updatedArray[index];
    setDatabases(updatedArray);
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Single Gene and Protein Expression Dashboard</title>
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <div className={styles.mainDiv}>

      <div className={styles.title}>
        <img className={styles.mainLogo} src="/images/logo.png" alt="App Logo" width={150} height={"auto"} />
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
          <h2>Transcriptomics</h2>
          <FormGroup>
            <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(0)} defaultChecked />} label={<><a className={styles.logoLink} href="https://gtexportal.org/home/" target="_blank" rel="noopener noreferrer"><img className={styles.t_databaseLogo} src="/images/GTEx.png" alt="GTEx Logo"/></a></>} labelPlacement="start"/>
            <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(1)} defaultChecked />} label={<><a className={styles.logoLink} href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer"><img className={styles.t_databaseLogo} src="/images/archs4.png" alt="archs4 Logo"/></a></>} labelPlacement="start"/>
            <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(2)} defaultChecked />} label={<><a className={styles.logoLink} href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer"><img className={styles.t_databaseLogo} style={{borderRadius: '8px', width: '200px', marginLeft: '15px'}} src="/images/tabula_sapiens.png" alt="Tabula Sapiens Logo"/></a></>} labelPlacement="start"/>
          </FormGroup>
        </div>

        <div className={styles.dbGroup}>
          <h2>Proteomics</h2>
          <div>
            <FormGroup>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(3)} defaultChecked />} label={<><a className={styles.logoLink} href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer"><img className={styles.p_databaseLogo} src="/images/HPM.gif" alt="HPM Logo"/></a></>} labelPlacement="start"/>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(4)} defaultChecked />} label={<><a className={styles.logoLink} href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer"><img className={styles.p_databaseLogo} src="/images/HPA.svg" alt="HPA Logo"/></a></>} labelPlacement="start"/>
              <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(5)} defaultChecked />} label={<><a className={styles.logoLink} href="https://gtexportal.org/home/" target="_blank" rel="noopener noreferrer"><img className={styles.p_databaseLogo} style={{width: 'auto'}} src="/images/GTEx.png" alt="GTEx Logo"/></a></>} labelPlacement="start"/>
            </FormGroup>
          </div>
        </div>  
      </div>

      {
          loading == true ? <CircularProgress/> : <></>
      }

      <div className={styles.buttonDiv}>
        {
          (gene != null) && !(databases.every(e => e === false)) ?
            <Link 
            href={{
              pathname: "gene/[gene]",
              query: {
                  gene: gene,
                  databases: databases
            }}}>
            <Button variant="contained" color="primary" onClick={()=>{setLoading(true)}}>Submit</Button>
          </Link>
          :
          <Button variant="contained" color="error">Select options to continue</Button>
        }
        <a className={styles.buttonLink} href="https://appyters.maayanlab.cloud/Gene_Expression_by_Tissue/"><Button color="primary" variant="contained">Run the Appyter <img className={styles.appyterLogo} src="/images/appyterLogo.png" alt="appyter logo"></img></Button></a>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <div><a className={styles.link} href="mailto:avi.maayan@mssm.edu">Contact Us</a></div>
          <div><a className={styles.link} href="https://github.com/MaayanLab/single-gene-expression-dashboard/blob/main/LICENSE">Usage License</a></div>
        </div>
        <div>
          <a href="https://icahn.mssm.edu/research/bioinformatics" target="_blank" rel="noopener noreferrer"><Image src="/images/icahn_cb.png" alt="School Logo" width={137} height={80} /></a>
        </div>
        <div>
          <a href="https://labs.icahn.mssm.edu/maayanlab/" target="_blank" rel="noopener noreferrer"><Image style={{borderRadius: '10px'}} src="/images/maayanlab_logo.png" alt="Lab Logo" width={80} height={80} /></a>
        </div>
        <div className={styles.githubButtons}>
          <a className={styles.buttonLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><Image style={{borderRadius: '5px'}} src="/images/GitHub-Mark.png" alt="GitHub Logo" width={16} height={16} />&nbsp;View source code</Button></a>
          <a className={styles.buttonLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard/issues/new" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><Image style={{borderRadius: '5px'}} src="/images/GitHub-Mark.png" alt="GitHub Logo" width={16} height={16} />&nbsp;Submit an issue</Button></a>
        </div>
      </footer>
        
      </div>
    </div>
  )
}
