import * as React from 'react';
import styles from '../styles/Header.module.css';
import Link from 'next/link';

export default class Header extends React.Component {

    render() {
        return (
            <div className={styles.title}>
                <Link href="/gene/A2M">
                    <img className={styles.mainLogo} src="/images/logo.png" alt="App Logo" width={75} height={"auto"} />
                </Link>
                <Link href="/gene/A2M">
                    <h1 className={styles.header}>GeneRanger</h1>
                </Link>
                <div className={styles.text}><b>GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases.</b></div>
            </div>
        );
    }

}