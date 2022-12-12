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
                <div className={styles.text}>GeneRanger takes the input of a human gene and displays its expression across normal human cell types, tissues, and cell lines utilizing processed datasets from GTEx, ARCHS4, Tabula Sapiens, and CCLE.</div>
            </div>
        );
    }

}