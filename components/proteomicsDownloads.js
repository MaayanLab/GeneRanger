import * as React from 'react';
import styles from '../styles/Main.module.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useRuntimeConfig } from './runtimeConfig';

function createData(database, size, shape, file_type, compression, download) {
    return { database, size, shape, file_type, compression, download };
}
export default function ProteomicsDownloads() {
    const runtimeConfig = useRuntimeConfig()
    const rows = React.useMemo(() => [
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} alt="HPM Logo"/>, '1.4 MB', '17294 x 32', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'HPM.tsv.gz'} download="HPM.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} alt="HPA Logo"/>, '845 KB', '13452 x 259', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'HPA.tsv.gz'} download="HPA.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} alt="GTEx Logo"/>, '7.3 MB', '100004 x 34', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'GTEx_proteomics.tsv.gz'} download="GTEx_proteomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} alt="CCLE Logo"/>, '28.5 MB', '12196 x 380', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'CCLE_proteomics.tsv.gz'} download="CCLE_proteomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>)
    ], [runtimeConfig])

    return (
        <Box sx={{ width: '80%'}}>
            <Box sx={{ width: '100%', display: "table", tableLayout: "fixed", justifyItems: 'center' }}>
                <Table sx={{ width: '100%' }}>
                    <TableHead>
                    <TableRow>
                        <TableCell>Database</TableCell>
                        <TableCell align="right">Download</TableCell>
                        <TableCell align="right">Size</TableCell>
                        <TableCell align="right">Shape</TableCell>
                        <TableCell align="right">File Type</TableCell>
                        <TableCell align="right">Compression</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.database}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{row.database}</TableCell>
                            <TableCell align="right">{row.download}</TableCell>
                            <TableCell align="right">{row.size}</TableCell>
                            <TableCell align="right">{row.shape}</TableCell>
                            <TableCell align="right">{row.file_type}</TableCell>
                            <TableCell align="right">{row.compression}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
}
