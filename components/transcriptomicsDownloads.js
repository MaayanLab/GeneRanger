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

export default function TranscriptomicsDownloads() {
    const runtimeConfig = useRuntimeConfig()
    const rows = React.useMemo(() => [
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="ARCHS4 Logo"/>, '109 MB', '281904 x 253', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'ARCHS4.tsv.gz'} download="ARCHS4.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo"/>, '39.2 MB', '449600 x 56', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'GTEx_transcriptomics.tsv.gz'} download="GTEx_transcriptomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} alt="Tabula Sapiens Logo"/>, '64.5 MB', '406856 x 471', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'Tabula_Sapiens.tsv.gz'} download="Tabula_Sapiens.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} alt="CCLE Logo"/>, '83.3 MB', '54347 x 1408', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'CCLE_transcriptomics.tsv.gz'} download="CCLE_transcriptomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>)
    ], [runtimeConfig])

    const rowsTranscript = React.useMemo(() => [
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="ARCHS4 Logo"/>, '494.9 MB', '1425088 x 253', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'ARCHS4_transcript.tsv.gz'} download="ARCHS4_transcript.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
        createData(<img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo"/>, '159.7 MB', '1594592 x 56', 'tsv', 'gzip', <a href={runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'GTEx_transcript.tsv.gz'} download="GTEx_transcriptomics.tsv.gz"><IconButton><FileDownloadIcon/></IconButton></a>),
    ], [runtimeConfig])
    
    return (
        <Box sx={{ width: '80%'}}>
            <Box sx={{ width: '100%', display: "table", tableLayout: "fixed", justifyItems: 'center' }}>
                <h3>Gene Level</h3>
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
                <h3>Transcript Level</h3>
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
                    {rowsTranscript.map((row) => (
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
