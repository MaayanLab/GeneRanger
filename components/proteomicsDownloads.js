import * as React from 'react';
import styles from '../styles/main.module.css';
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
    createData(<img className={styles.databaseLogo} src="/images/HPM.gif" alt="HPM Logo"/>, '?', '?', '?', <a href="" download=""><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/HPA.svg" alt="HPA Logo"/>, '?', '?', '?', <a href="" download=""><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/GTEx_proteomics.png" alt="GTEx Logo"/>, '?', '?', '?', <a href="" download=""><IconButton><FileDownloadIcon/></IconButton></a>),
    createData(<img  className={styles.databaseLogo} src="/images/CCLE_proteomics.jpeg" alt="CCLE Logo"/>, '?', '?', '?', <a href="" download=""><IconButton><FileDownloadIcon/></IconButton></a>)
];

export default class ProteomicsDownloads extends React.Component {

    render() {
        return (
            <>
                <h1>Proteomics Databases:</h1>

                <TableContainer component={Paper}>
                    <Table sx={{ maxWidth: 2500 }} aria-label="simple table">
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
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {row.database}
                            </TableCell>
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