import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRouter } from 'next/router';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DownloadIcon from '@mui/icons-material/Download';
import Popover from '@mui/material/Popover';
import exampleData from '../public/files/GSE49155.json';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Alert } from '@mui/material';


export default function Page() {

    // For MUI loading icon

    const [loading, setLoading] = React.useState(false);
    const [file, setFile] = React.useState(null);
    const [useDefaultFile, setUseDefaultFile] = React.useState(false);
    const [alert, setAlert] = React.useState('')

    const [membraneGenes, setMembraneGenes] = React.useState(true);

    const [precomputedBackground, setPrecomputedBackground] = React.useState(0);


    const router = useRouter();


    async function submitGeneStats(fileStats) {

        let res = await fetch(`${process.env.NEXT_PUBLIC_ENTRYPOINT || ''}/api/query_db_targets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'inputData': fileStats, 'bg': precomputedBackground })
        })
        let json = await res.json();
        const genes = json.map(item => item.gene)
        const genesIncluded = Object.keys(fileStats['genes'])
        var targetStats = {}
        for (let i = 0; i < genes.length; i++) {
            if (genesIncluded.includes(genes[i])) targetStats[genes[i]] = fileStats['genes'][genes[i]]
        }

        let href = {
            pathname: "/targetscreenerresults",
            query: {
                res: JSON.stringify(json),
                ogfile: JSON.stringify(targetStats),
                membraneGenes: membraneGenes,
            }
        };
        router.push(href, '/targetscreenerresults').then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false)
            alert('Error with returned data')
        })
    }


    function stddev(arr) {
        // Creating the mean with Array.reduce
        let mean = arr.reduce((acc, curr) => {
            return acc + parseFloat(curr)
        }, 0) / arr.length

        // Assigning (value - mean) ^ 2 to every array item
        arr = arr.map((k) => {
            return (k - mean) ** 2
        })

        // Calculating the sum of updated array
        let sum = arr.reduce((acc, curr) => acc + curr, 0);

        // Calculating the variance
        let variance = sum / arr.length

        let std = Math.sqrt(variance)
        // Returning the standard deviation
        return [mean, std]
    }

    let fileReader;

    var geneStats;

    const handleFileRead = (e) => {
        const content = fileReader.result;
        var rows = content.split('\n').map(row => row.split('\t'))
        var n = rows[0].length - 1
        geneStats = {}
        var gene;
        var data;
        var stats;
        for (let i = 1; i < rows.length; i++) {
            gene = rows[i].slice(0, 1)
            data = rows[i].slice(1, rows.legnth)
            stats = stddev(data)
            if (stats[0] !== null && (stats[1] != 0 && stats[0] != 0)) {
                if (gene != '') geneStats[gene] = { 'std': stats[1], 'mean': stats[0] }
            }
        }
        const fileStats = { 'genes': geneStats, 'n': n }
        submitGeneStats(fileStats)
    };

    const handleFileChosen = (file) => {
        fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(file);
    };


    async function submitTest() {
        if (useDefaultFile != false || file != null) {
            if (useDefaultFile) {
                setLoading(true);

                submitGeneStats(exampleData)

            } else {

                setLoading(true);

                const params = { membraneGenes, showProteinProfiles }

                setLoading(false);

                handleFileChosen(file)
            }
        } else {
            setAlert(<Alert variant="outlined" severity="error">Please select a file to submit</Alert>)
            setTimeout(() => {
                setAlert('');
              }, 3000);
        }
    }

    // For input file example table

    function createData(name, rep1, rep2, rep3) {
        return { name, rep1, rep2, rep3 };
    }

    const rows = [
        createData('Gene Symbol', 0, 200, '...'),
        createData('Gene Symbol', 5, 180, '...'),
        createData('...', '...', '...', '...')
    ];

    // For MUI Popover

    const [anchorEl, setAnchorEl] = React.useState(null);

    return (

        <div style={{ position: 'relative', minHeight: '100vh' }}>

            <Head />

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress size="10rem" />
            </Backdrop>

            <div className={styles.mainDiv}>

                <Header />

                <h1>Target Screener</h1>

                <Card>
                    <CardContent>


                        <div style={{ flexWrap: 'wrap', gap: '50px' }} className={styles.horizontalFlexbox}>

                            <div className={styles.verticalFlexbox}>

                                <div>Tumor RNA-seq expression vectors</div>

                                <div className={styles.horizontalFlexbox}>

                                    <div className={styles.verticalFlexbox}>
                                        <input
                                            style={{ display: "none" }}
                                            id="fileUpload"
                                            type="file"
                                            onChange={(e) => { setUseDefaultFile(false); setFile(e.target.files[0]) }}
                                        />
                                        <label htmlFor="fileUpload">
                                            <Button variant="contained" color="primary" component="span">
                                                Upload File
                                            </Button>
                                        </label>
                                        <div className={styles.horizontalFlexbox}>
                                            <Button onClick={() => setUseDefaultFile(true)} className={styles.darkOnHover} variant="text" >
                                                Load example file
                                            </Button>
                                            <a style={{ textDecoration: 'none' }} href="files/GSE49155-patient.tsv" download="GSE49155-patient.tsv">
                                                <Button className={styles.darkOnHover} variant="text" endIcon={<DownloadIcon />}>
                                                    Download example file
                                                </Button>
                                            </a>
                                        </div>
                                        <Button className={styles.darkOnHover} onClick={(event) => { setAnchorEl(event.currentTarget) }} variant="text" endIcon={<HelpOutlineIcon />}>
                                            File specifications
                                        </Button>
                                        <Popover
                                            open={Boolean(anchorEl)}
                                            anchorEl={anchorEl}
                                            onClose={() => { setAnchorEl(null) }}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'center',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                        >
                                            <TableContainer component={Paper}>
                                                <Typography
                                                    sx={{ textAlign: 'center' }}
                                                    variant="h6"
                                                >
                                                    File should be a tsv/csv of the following form:
                                                </Typography>
                                                <Table sx={{ width: 500 }} size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell></TableCell>
                                                            <TableCell align="right"><b>Replicate 1</b></TableCell>
                                                            <TableCell align="right"><b>Replicate 2</b></TableCell>
                                                            <TableCell align="right"><b>...</b></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {rows.map((row) => (
                                                            <TableRow key={row.name}>
                                                                <TableCell><b>{row.name}</b></TableCell>
                                                                <TableCell align="right">{row.rep1}</TableCell>
                                                                <TableCell align="right">{row.rep2}</TableCell>
                                                                <TableCell align="right">{row.rep3}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Popover>

                                        <Button onClick={() => { setUseDefaultFile(false); setFile(null) }} variant="outlined" component="span">
                                            Clear Chosen File
                                        </Button>
                                    </div>
                                </div>
                                <div>Chosen file:</div>
                                <div>{file == null && useDefaultFile == false ? "None" : useDefaultFile == true ? "GSE49155-patient.tsv" : file.name}</div>

                            </div>

                            <div style={{ alignItems: 'flex-start' }} className={styles.verticalFlexbox}>

                            </div>

                            <div className={styles.verticalFlexbox}>

                                <div className={styles.verticalFlexbox}>
                                    <div>Normal tissue background:</div>

                                    <div className={styles.horizontalFlexbox}>
                                        <Box sx={{ width: 390 }}>
                                            <FormControl fullWidth>
                                                <Select
                                                    value={precomputedBackground}
                                                    onChange={(event) => setPrecomputedBackground(event.target.value)}
                                                >
                                                    <MenuItem value={0}>ARCHS4 (bulk RNA-seq)</MenuItem>
                                                    <MenuItem value={1}>GTEx (bulk RNA-seq)</MenuItem>
                                                    <MenuItem value={2}>Tabula Sapiens (scRNA-seq)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </div>
                                </div>
                                <div className={styles.horizontalFlexbox}>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={membraneGenes}
                                        exclusive
                                        onChange={(event, newValue) => { if (newValue !== null) setMembraneGenes(newValue) }}
                                    >
                                        <ToggleButton value={true}>Yes</ToggleButton>
                                        <ToggleButton value={false}>No</ToggleButton>
                                    </ToggleButtonGroup>
                                    <div>Prioritize membrane genes</div>
                                </div>
                            </div>




                        </div>
                    </CardContent>
                    <CardActions style={{ justifyContent: 'center' }}>
                        <Button style={{ marginTop: '25px' }} variant="contained" color="primary" size='large'onClick={submitTest}>Submit</Button>
                    </CardActions>
                </Card>
                <>
                {alert}
                </>
                <Footer />
            </div>
        </div>

    )
}
