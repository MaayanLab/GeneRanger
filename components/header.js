import * as React from 'react';
import styles from '../styles/Header.module.css';
import Link from 'next/link';

export default class Header extends React.Component {

    render() {
        return (
            <>
                <div className={styles.longTitle}>
                    <div className={styles.logoAndTitleDiv}>
                        <Link href="/gene/A2M">
                            <img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/logo.png'} alt="App Logo" width={75} height={75} />
                        </Link>
                        <Link href="/gene/A2M">
                            <h1 style={{fontSize: '40px'}}>GeneRanger</h1>
                        </Link>
                    </div>
                    <div className={styles.rightDiv}>
                        <div className={styles.text}><b>GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases.</b></div>
                        <div className={styles.APIandDownloadDiv}>
                            <Link href="/api_documentation"><a className={styles.headerLink}>API Documentation</a></Link>
                            <Link href="/downloads"><a className={styles.headerLink}>Download</a></Link>
                        </div>
                    </div>
                </div>
                <div className={styles.shortTitle}>
                    <div className={styles.centerDiv}>
                        <div className={styles.logoAndTitleDiv}>
                            <Link href="/gene/A2M">
                                <img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/logo.png'} alt="App Logo" width={75} height={75} />
                            </Link>
                            <Link href="/gene/A2M">
                                <h1 style={{fontSize: '40px'}}>GeneRanger</h1>
                            </Link>
                        </div>
                        <div className={styles.APIandDownloadDiv}>
                            <Link href="/api_documentation"><a className={styles.headerLink}>API Documentation</a></Link>
                            <Link href="/downloads"><a className={styles.headerLink}>Download</a></Link>
                        </div>
                    </div>
                </div>
            </>
            
        );
    }

}