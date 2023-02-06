import { Button } from '@mui/material';
import * as React from 'react';
import styles from '../styles/GeneDescription.module.css';

function GeneAndGraphDescription({NCBI_data, gene, database, database_desc, data}) {

    // Gene links

    let NCBI_entrez = 'https://www.ncbi.nlm.nih.gov/gene/?term=' + gene;
    let GeneCards = 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + gene;
    let Harmonizome = 'https://maayanlab.cloud/Harmonizome/gene/' + gene;
    let ARCHS4_link = 'https://maayanlab.cloud/archs4/gene/' + gene;
    let GDLPA = 'https://cfde-gene-pages.cloud/gene/' + gene +'?CF=false&PS=true&Ag=true&gene=false&variant=false';

    return (
        <>
            {/* {
                NCBI_data == 'No gene description available.'
                    ?
                        <div style={{textAlign: 'center'}}>{NCBI_data}</div>
                    :
                        <> */}
                            <div><b>Short description (from <a href={NCBI_entrez} target="_blank" rel="noopener noreferrer">NCBI&apos;s Gene Database</a>):</b> {NCBI_data}</div>
                            <br/>
                            <div><b>Gene pages on other sites:</b></div>
                            <br/>
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '25px'}}>
                                <a className={styles.geneLink} href={ARCHS4_link} target="_blank" rel="noopener noreferrer">ARCHS4</a>
                                <a className={styles.geneLink} href={Harmonizome} target="_blank" rel="noopener noreferrer">Harmonizome</a>
                                <a className={styles.geneLink} href={NCBI_entrez} target="_blank" rel="noopener noreferrer">Entrez Gene</a>
                                <a className={styles.geneLink} href={GeneCards} target="_blank" rel="noopener noreferrer">GeneCards</a>
                                <a className={styles.geneLink} href={GDLPA} target="_blank" rel="noopener noreferrer">GDLPA</a>
                            </div>
                            <br/>
                            <div><b>{database}:</b> {database_desc}</div>
                            
                            <div className={styles.download}>
                                <Button href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`} download={gene + '-' + database.props.children + '.json' }> Download plot data</Button>
                            </div>
                        {/* </>
                        
            } */}
        </> 
    );
}

export default GeneAndGraphDescription;

