import { Button } from '@mui/material';
import * as React from 'react';
import styles from '../styles/GeneDescription.module.css';
import { useRouter } from 'next/router'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';



function createCSV(gene, data, dbname) {
    console.log(dbname)
    var csvData = '';
    if (dbname == 'ARCHS4' || dbname == 'ARCHS4_norm'|| dbname == 'GTEx transcriptomics' || dbname == 'Tabula Sapiens' || dbname == 'GTEx proteomics' || dbname == 'Human BioMolecular Atlas Program (HubMAP)') {
        csvData += ',,' + [...data.names].reverse().join(',') + '\n'
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
        csvData += ',,' + [...data.names].reverse().join(',') + '\n'
        csvData += `${gene},value,` + [...data.values].reverse().join(',')
    }
    return csvData;
}

function GeneAndGraphDescription({ index, NCBI_data, gene, transcript, database, database_desc, data, mappings, horizontal, setHorizontal, viewNormExpression=null, setViewNormExpression=null }) {

    const router = useRouter();

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


    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const open2 = Boolean(anchorEl2);
    const handleClick2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };
    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    return (
        <>
            <div><b>Short description (from <a href={NCBI_entrez} target="_blank" rel="noopener noreferrer">NCBI&apos;s Gene Database</a>):</b> {NCBI_data}</div>



            <div><b>Gene pages on other sites:</b></div>
            <br />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
                {transcript && <a className={styles.geneLink} href={Ensembl_link} target="_blank" rel="noopener noreferrer">Ensembl</a>}
                <a className={styles.geneLink} href={ARCHS4_link} target="_blank" rel="noopener noreferrer">ARCHS4</a>
                <a className={styles.geneLink} href={Harmonizome} target="_blank" rel="noopener noreferrer">Harmonizome</a>
                <a className={styles.geneLink} href={NCBI_entrez} target="_blank" rel="noopener noreferrer">Entrez Gene</a>
                <a className={styles.geneLink} href={GeneCards} target="_blank" rel="noopener noreferrer">GeneCards</a>
                <a className={styles.geneLink} href={GDLPA} target="_blank" rel="noopener noreferrer">GDLPA</a>
                <div style={{ textAlign: 'right', marginLeft: '25px' }}>
                    {transcript && <Button variant="outlined" onClick={() => {
                        router.push(`/gene/${gene}?database=ARCHS4`).then(() => {
                        });
                    }}>
                        {`View Expression of ${gene}`}
                    </Button>}
                    {mappings && <div>
                        <Button
                            id="demo-positioned-button"
                            aria-controls={open2 ? 'demo-positioned-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open2 ? 'true' : undefined}
                            onClick={handleClick2}
                            variant='outlined'
                        >
                            View Transcript Expression
                        </Button>
                        <Menu
                            id="demo-positioned-menu"
                            aria-labelledby="demo-positioned-button"
                            anchorEl={anchorEl2}
                            open={open2}
                            onClose={handleClose2}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            {mappings.map((element) => {
                                return <MenuItem key={element.transcript} onClick={() => { handleClose2; router.push(`/transcript/${element.transcript}?database=ARCHS4_transcript`) }}>{element.transcript}</MenuItem>
                            })}
                        </Menu>
                        &nbsp;
                        {index === 1 ? <a href={`/gene/${gene}?database=GTEx`} style={{textDecoration: 'none'}}><Button variant='outlined'>Plot with Proteomics</Button></a> : null}
                        {index === 6 ? <a href={`/gene/${gene}?database=GTEx`} style={{textDecoration: 'none'}}><Button variant='outlined'>Plot with Transcriptomics</Button></a> : null}
                    </div>}
                </div>
            </div>
            <br />
            <div><b>{database}:</b> {database_desc}</div>
            <div style={{ display: 'flex', margin: '1%', textAlign: 'right', justifyContent: 'end' }}>
                <div >
                    {viewNormExpression != null ? 
                    <Button
                        variant="outlined"
                        sx={{ justifyContent: 'start', marginTop: '10px', marginRight: '10px' }}
                        onClick={() => setViewNormExpression(!viewNormExpression)}
                    >
                        {viewNormExpression ? 'View Raw Expression' : 'View Normalized Expression'}
                    </Button>: <></>}
                    <ToggleButtonGroup
                        color="secondary"
                        value={horizontal}
                        exclusive
                        sx={{ marginBottom: '10px' }}
                        onChange={(event, newValue) => {
                            if (newValue !== null)
                                setHorizontal(newValue);
                        }
                        }
                    >
                        <ToggleButton value={false}>Vertical</ToggleButton>
                        <ToggleButton value={true}>Horizontal</ToggleButton>
                    </ToggleButtonGroup>
                </div>
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
            </div>
        </>
    );
}

export default GeneAndGraphDescription;

