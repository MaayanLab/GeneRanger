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
    createData(<img className={styles.databaseLogo} src="/images/HPM.gif" alt="HPM Logo"/>, '4.7 MB', '17294 x 32', 'tsv', <a href="../files/downloads/HPM.tsv" download="HPM.tsv"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/HPA.svg" alt="HPA Logo"/>, '13.3 MB', '13452 x 259', 'tsv', <a href="../files/downloads/HPA.tsv" download="HPA.tsv"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/GTEx_proteomics.png" alt="GTEx Logo"/>, '25 MB', '100004 x 34', 'tsv', <a href="../files/downloads/GTEx_proteomics.tsv" download="GTEx_proteomics.tsv"><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/CCLE_proteomics.jpeg" alt="CCLE Logo"/>, '63.1 MB', '12196 x 380', 'tsv', <a href="../files/downloads/CCLE_proteomics.tsv" download="CCLE_proteomics.tsv"><IconButton><FileDownloadIcon/></IconButton></a>)
];

export default class ProteomicsDownloads extends React.Component {

    render() {
        return (
            <>
                <h1>Proteomics Databases:</h1>

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