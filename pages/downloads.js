import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/Main.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import Button from '@mui/material/Button';

export default function Page() {

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <div style={{height: '1500px'}}>
                        <b>Download the databases:</b>
                 
                    <p>Transcriptomics:</p>
                    <Button variant="contained" color="primary">ARCHS4</Button>
                    <Button variant="contained" color="primary">GTEx Transcriptomics</Button>
                    <Button variant="contained" color="primary">Tabula Sapiens</Button>
                    <Button variant="contained" color="primary">Cancer Cell Line Encyclopedia (Transcriptomics)</Button>
                    <p>Proteomics:</p>
                    <Button variant="contained" color="primary">Human Proteome Map</Button>
                    <Button variant="contained" color="primary">Human Protein Atlas</Button>
                    <Button variant="contained" color="primary">GTEx Proteomics</Button>
                    <Button variant="contained" color="primary">Cancer Cell Line Encyclopedia (Proteomics)</Button>
                    <p>[TODO: Make these buttons actually work (and look good)]</p>
                    
                </div>
                <Footer/>

            </div>
        </div>
      
    )
  }

