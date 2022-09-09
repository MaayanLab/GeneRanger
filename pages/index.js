import Head from 'next/head';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../styles/Home.module.css';
import { FormGroup, FormControlLabel, Switch, TextField, Button, Autocomplete } from '@mui/material';
import genes from '../json/genes.json';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router'
import Footer from '../components/footer';

export default function Home() {

  // const [gene, setGene] = useState();
  const [databases, setDatabases] = useState([true, true, true, true, true, true]);
  const [loading, setLoading] = useState(false);

  function updateDatabases(index) {
    let updatedArray = [...databases];
    updatedArray[index] = !updatedArray[index];
    setDatabases(updatedArray);
  }

  const router = useRouter();

  function submitGene (gene) {
    console.log(gene)
    if (gene != null) {
      let href = {
        pathname: "gene/[gene]",
        query: {
            gene: gene,
            databases: databases
      }};
      router.push(href)
      setLoading(true)
    } else {
      setLoading(false)
    }
    
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
          onChange={(event, value) => {submitGene(value)}}
          renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
        />
        {
          loading == true ? <div style={{display: 'flex', justifyContent: 'center', marginTop: '15px'}}><CircularProgress/></div> : <></>
        }
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

      {/* <div className={styles.buttonDiv}>
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
      </div> */}

      
        <Footer/>
      </div>
    </div>
  )
}
