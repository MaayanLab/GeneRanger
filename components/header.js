import * as React from 'react';
import styles from '../styles/Header.module.css';
import Link from 'next/link';
import { useRuntimeConfig } from "./runtimeConfig";

export default function Header() {
    const runtimeConfig = useRuntimeConfig()
    return (
            <>
                <div className={styles.longTitle}>
                    <div className={styles.logoAndTitleDiv}>
                        <Link href="/gene/A2M">
                            <img src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + '/images/logo.png'} alt="App Logo" width={75} height={75} />
                        </Link>
                        <Link href="/gene/A2M">
                            <h1 style={{fontSize: '40px'}}>GeneRanger</h1>
                        </Link>
                    </div>
                    <div className={styles.text}><b>GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases.</b></div>
                    <div className={styles.rightDiv}>
                        <div className={styles.verticalFlexbox}>
                            <b style={{fontSize: '16px', marginBottom: '5px'}}>Identify targets with:</b>
                            <Link href={process.env.NEXT_PUBLIC_TARGETRANGERURL || ''} ><a style={{textDecoration: 'none'}}><img src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + '/images/TargetRangerLogo.png'} alt="Logo" width={50} /><div className={styles.sisterSite}><b>TargetRanger</b></div></a></Link>
                        </div>
                           
                    </div>
                </div>
                <div className={styles.shortTitle}>
                    <div className={styles.centerDiv}>
                        <div className={styles.logoAndTitleDiv}>
                            <Link href="/gene/A2M">
                                <img src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + '/images/logo.png'} alt="App Logo" width={75} height={75} />
                            </Link>
                            <Link href="/gene/A2M">
                                <h1 style={{fontSize: '40px'}}>GeneRanger</h1>
                            </Link>
                        </div>
                        <div className={styles.rightDiv}>
                        <div className={styles.verticalFlexbox}>
                            <b style={{fontSize: '16px', marginBottom: '5px'}}>Identify targets with:</b>
                            <Link href={process.env.NEXT_PUBLIC_TARGETRANGERURL || ''} ><a style={{textDecoration: 'none'}}><img src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + '/images/TargetRangerLogo.png'} alt="Logo" width={50} /><div className={styles.sisterSite}><b>TargetRanger</b></div></a></Link>
                        </div>
                    </div>
                    </div>
                </div>
            </>
            
        );
}