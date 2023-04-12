import { Button, Menu } from '@mui/material';
import * as React from 'react';
import styles from '../styles/GeneDescription.module.css';

function createCSV(gene, data, dbname) {
    var csvData = '';
    if (dbname == 'ARCHS4' || dbname == 'GTEx transcriptomics' || dbname == 'Tabula Sapiens' || dbname == 'GTEx proteomics') {
        csvData += ',,' + [...data.y].reverse().join(',') + '\n'
        csvData += `${gene},25%,` + [...data.q1].reverse().join(',') + '\n'
        csvData += `${gene},50%,` + [...data.median].reverse().join(',') + '\n'
        csvData += `${gene},75%,` + [...data.q3].reverse().join(',') + '\n'
        csvData += `${gene},mean,` + [...data.mean].reverse().join(',') + '\n'
        if (dbname != 'ARCHS4') {
            csvData += `${gene},std,` + [...data.sd].reverse().join(',') + '\n'
        }
        csvData += `${gene},min,` + [...data.lowerfence].reverse().join(',') + '\n'
        csvData += `${gene},max,` + [...data.upperfence].reverse().join(',') + '\n'
    } else {
        csvData += ',,' + [...data.y].reverse().join(',') + '\n'
        csvData += `${gene},value,` + [...data.x].reverse().join(',')
    }
    return csvData;
}

function GeneAndGraphDescription({ NCBI_data, gene, transcript, database, database_desc, data, mappings }) {


    // Gene links
    let Ensembl_link = 'https://useast.ensembl.org/Homo_sapiens/Transcript/Summary?t=' + transcript;
    let NCBI_entrez = 'https://www.ncbi.nlm.nih.gov/gene/?term=' + gene;
    let GeneCards = 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + gene;
    let Harmonizome = 'https://maayanlab.cloud/Harmonizome/gene/' + gene;
    let ARCHS4_link = 'https://maayanlab.cloud/archs4/gene/' + gene;
    let GDLPA = 'https://cfde-gene-pages.cloud/gene/' + gene + '?CF=false&PS=true&Ag=true&gene=false&variant=false';


    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        
    };
    var dbname = database.props.children;

    const formatCSV = () => {
        const csvData = createCSV(gene, data, dbname)
        var downloadLink = document.createElement("a");
        downloadLink.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
        downloadLink.download = `${gene}-${dbname}.csv`

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    


    return (
        <>
            {/* {
                NCBI_data == 'No gene description available.'
                    ?
                        <div style={{textAlign: 'center'}}>{NCBI_data}</div>
                    :
                        <> */}
            <div><b>Short description (from <a href={NCBI_entrez} target="_blank" rel="noopener noreferrer">NCBI&apos;s Gene Database</a>):</b> {NCBI_data}</div>
            {/* {View Expression of $gene} */}
            <br />
            <div><b>Gene pages on other sites:</b></div>
            <br />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
                {transcript && <a className={styles.geneLink} href={Ensembl_link} target="_blank" rel="noopener noreferrer">Ensembl</a>}
                <a className={styles.geneLink} href={ARCHS4_link} target="_blank" rel="noopener noreferrer">ARCHS4</a>
                <a className={styles.geneLink} href={Harmonizome} target="_blank" rel="noopener noreferrer">Harmonizome</a>
                <a className={styles.geneLink} href={NCBI_entrez} target="_blank" rel="noopener noreferrer">Entrez Gene</a>
                <a className={styles.geneLink} href={GeneCards} target="_blank" rel="noopener noreferrer">GeneCards</a>
                <a className={styles.geneLink} href={GDLPA} target="_blank" rel="noopener noreferrer">GDLPA</a>
            </div>
            <br />
            <div><b>{database}:</b> {database_desc}</div>

            <div className={styles.download}>
                <Button
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    Download plot data
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <Button download={gene + '-' + database.props.children + '.csv'} onClick={formatCSV}>CSV</Button>
                    <Button href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`} download={gene + '-' + database.props.children + '.json'} onClick={handleClose}>JSON</Button>
                </Menu>
            </div>
        </>
    );
}

export default GeneAndGraphDescription;

