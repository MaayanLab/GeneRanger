import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/Main.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';

export default function Page() {

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <div style={{margin: '20px 50px 250px 50px'}}>

                    <h1>Usage License</h1>

                    <div>The services provided by GeneRanger are free for academic, non-profit use. Regarding the use of the data, please check the terms of use at the original data sources.</div>

                </div>

                <Footer/>

            </div>
        </div>
      
    )
  }