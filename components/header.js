import * as React from 'react';
import styles from '../styles/Header.module.css';

export default class Header extends React.Component {

    render() {
        return (
            <div className={styles.title}>
                <img className={styles.mainLogo} src="/images/logo.png" alt="App Logo" width={75} height={"auto"} />
                <h1 className={styles.header}>GeneRanger</h1>
                <div className={styles.text}>GeneRanger takes the input of a human gene and displays its expression across human cells and tissues utilizing a variety of processed datasets from healthy tissues. If the gene is not contained in one of the datasets, a plot will not be produced for that resource.</div>
            </div>
        );
    }

}