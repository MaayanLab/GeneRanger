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
import Box from '@mui/material/Box';

function createData(database, size, shape, file_type, compression, download) {
    return { database, size, shape, file_type, compression, download };
}

const rows = [
    createData(<img className={styles.databaseLogo} src="/images/archs4.png" alt="ARCHS4 Logo"/>, '444.8 MB', '281904 x 365', 'tsv', 'gzip', <a href={process.env.NEXT_PUBLIC_DOWNLOADS + 'ARCHS4.tsv.gz'} download="ARCHS4.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/GTEx_transcriptomics.png" alt="GTEx Logo"/>, '114.7 MB', '449600 x 56', 'tsv', 'gzip', <a href={process.env.NEXT_PUBLIC_DOWNLOADS + 'GTEx_transcriptomics.tsv.gz'} download="GTEx_transcriptomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/tabula_sapiens.png" alt="Tabula Sapiens Logo"/>, '451.1 MB', '406856 x 471', 'tsv', 'gzip', <a href={process.env.NEXT_PUBLIC_DOWNLOADS + 'Tabula_Sapiens.tsv.gz'} download="Tabula_Sapiens.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/CCLE_transcriptomics.jpeg" alt="CCLE Logo"/>, '372.1 MB', '54347 x 1408', 'tsv', 'gzip', <a href={process.env.NEXT_PUBLIC_DOWNLOADS + 'CCLE_transcriptomics.tsv.gz'} download="CCLE_transcriptomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>)
];

export default class TranscriptomicsDownloads extends React.Component {

    render() {
        return (
            <Box sx={{ overflow: "auto" }}>
                <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                    <Table sx={{ width: '100%'}}>
                        <TableHead>
                        <TableRow>
                            <TableCell>Database</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Shape</TableCell>
                            <TableCell align="right">File Type</TableCell>
                            <TableCell align="right">Compression</TableCell>
                            <TableCell align="right">Download</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.database}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">{row.database}</TableCell>
                                <TableCell align="right">{row.size}</TableCell>
                                <TableCell align="right">{row.shape}</TableCell>
                                <TableCell align="right">{row.file_type}</TableCell>
                                <TableCell align="right">{row.compression}</TableCell>
                                <TableCell align="right">{row.download}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        );
    }

}