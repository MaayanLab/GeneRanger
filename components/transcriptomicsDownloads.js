import * as React from 'react';
import styles from '../styles/Main.module.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';

function createData(database, size, shape, file_type, download) {
    return { database, size, shape, file_type, download };
}

const rows = [
    createData(<img className={styles.databaseLogo} src="/images/archs4.png" alt="ARCHS4 Logo"/>, '444.8 MB', '281904 x 365', 'tsv', <a href="../files/downloads/ARCHS4.tsv" download="ARCHS4.tsv"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/GTEx_transcriptomics.png" alt="GTEx Logo"/>, '114.7 MB', '449600 x 56', 'tsv', <a href="../files/downloads/GTEx_transcriptomics.tsv" download="GTEx_transcriptomics.tsv"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/tabula_sapiens.png" alt="Tabula Sapiens Logo"/>, '451.1 MB', '406856 x 471', 'tsv', <a href="../files/downloads/Tabula_Sapiens.tsv" download="Tabula_Sapiens.tsv"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/CCLE_transcriptomics.jpeg" alt="CCLE Logo"/>, '372.1 MB', '54347 x 1408', 'tsv', <a href="../files/downloads/CCLE_transcriptomics.tsv" download="CCLE_transcriptomics.tsv"><IconButton><FileDownloadIcon/></IconButton></a>)
];

export default class TranscriptomicsDownloads extends React.Component {

    render() {
        return (
            <>
                <h1>Transcriptomics Databases:</h1>

                <TableContainer component={Paper}>
                    <Table sx={{ maxWidth: 2500 }}>
                        <TableHead>
                        <TableRow>
                            <TableCell>Database</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Shape</TableCell>
                            <TableCell align="right">File Type</TableCell>
                            <TableCell align="right">Download</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.database}
                            >
                                <TableCell>{row.database}</TableCell>
                                <TableCell align="right">{row.size}</TableCell>
                                <TableCell align="right">{row.shape}</TableCell>
                                <TableCell align="right">{row.file_type}</TableCell>
                                <TableCell align="right">{row.download}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    }

}