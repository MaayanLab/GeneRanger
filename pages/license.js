import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/Main.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import { useRuntimeConfig } from '../components/runtimeConfig';

export default function Page() {
    const runtimeConfig = useRuntimeConfig()

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <div style={{margin: '20px 50px 250px 50px'}}>

                    <h1 style={{textAlign: 'center'}}>Usage License</h1>

                    
                    <a href='https://creativecommons.org/licenses/by-sa/3.0/' target={'_blank'} rel={"noopener noreferrer"}><img style={{maxWidth: '400px'}} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CC_BY-SA_3.0.png"} alt={"CC BY-SA 3.0"}></img></a>
                    <div style={{textAlign: 'center'}}> <a href='https://creativecommons.org/licenses/by-sa/3.0/' target={'_blank'} rel={"noopener noreferrer"}>CC BY-SA 3.0</a></div>
                </div>

                <Footer/>

            </div>
        </div>
      
    )
  }