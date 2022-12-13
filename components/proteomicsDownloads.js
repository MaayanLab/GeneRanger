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

function createData(database, size, shape, file_type, compression, download) {
    return { database, size, shape, file_type, compression, download };
}

const rows = [
    createData(<img className={styles.databaseLogo} src="/images/HPM.gif" alt="HPM Logo"/>, '4.7 MB', '17294 x 32', 'tsv', 'gzip', <a href="https://minio.dev.maayanlab.cloud/generanger/HPM.tsv.gz" download="HPM.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/HPA.svg" alt="HPA Logo"/>, '13.3 MB', '13452 x 259', 'tsv', 'gzip', <a href="https://minio.dev.maayanlab.cloud/generanger/HPA.tsv.gz" download="HPA.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/GTEx_proteomics.png" alt="GTEx Logo"/>, '25 MB', '100004 x 34', 'tsv', 'gzip', <a href="https://minio.dev.maayanlab.cloud/generanger/GTEx_proteomics.tsv.gz" download="GTEx_proteomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/CCLE_proteomics.jpeg" alt="CCLE Logo"/>, '63.1 MB', '12196 x 380', 'tsv', 'gzip', <a href="https://minio.dev.maayanlab.cloud/generanger/CCLE_proteomics.tsv.gz" download="CCLE_proteomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>)
];

export default class ProteomicsDownloads extends React.Component {

    render() {
        return (
            <>
                <h1>Proteomics Processed Datasets:</h1>

                <Paper variant="outlined">
                    <Table sx={{ maxWidth: 2500 }}>
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
                </Paper>
            </>
        );
    }

}