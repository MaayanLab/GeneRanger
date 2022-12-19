import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/Main.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import TranscriptomicsDownloads from '../components/transcriptomicsDownloads';
import ProteomicsDownloads from '../components/proteomicsDownloads';

export default function Page() {

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <div style={{marginBottom: '175px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

                    <h1>Transcriptomics Processed Datasets:</h1>
                    <TranscriptomicsDownloads/>
                    <h1>Proteomics Processed Datasets:</h1>
                    <ProteomicsDownloads/>

                </div>

                <Footer/>

            </div>
        </div>
      
    )
  }

