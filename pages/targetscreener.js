import { Responsive, WidthProvider } from "react-grid-layout";
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
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
import {useRouter} from 'next/router';
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

export default function Page() {

    // For MUI loading icon

    const [loading, setLoading] = React.useState(false);

    const [level, setLevel] = React.useState(false);

    const [file, setFile] = React.useState(null);
    const [useDefaultFile, setUseDefaultFile] = React.useState(false);

    const [membraneGenes, setMembraneGenes] = React.useState(true);
    const [backgroundDistribution, setBackgroundDistribution] = React.useState(true);
    const [showProteinProfiles, setShowProteinProfiles] = React.useState(true);

    const [precomputedBackground, setPrecomputedBackground] = React.useState(0);

    const router = useRouter();

    

    async function submit() {
        
        if (useDefaultFile != false || file != null) {
            setLoading(true);

            const formData = new FormData()
            let f = null;
            if (!useDefaultFile) {
                f = file;
                formData.append("file", file);
            } else {
                formData.append("file", null);
            }

            formData.append("tumor_transcript_level", level);
            formData.append("organism", 'Homo sapiens')
            formData.append("precomputed", precomputedBackground);
            formData.append("membrane_screener", membraneGenes);
            formData.append("normalize_to_background", backgroundDistribution);
            formData.append("proteomics_vis", showProteinProfiles);


            var res = await fetch("https://dd43-68-175-67-11.ngrok.io/pythonapi/rundge", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            }).catch(err => {
                console.log(err)
                setLoading(false)
            })
            const data = await res.json()

            console.log(data.targets)

            
            let href = {
                pathname: "/targetscreenerresults",
                query: {
                    available: data.avalible,
                    bg_head: data.background_head,
                    data_head: data.data_head,
                    dge: data.dge,
                    dge_table: data.dge_table,
                    targets: JSON.stringify(data.targets),
            }};
            router.push(href, '/targetscreenerresults').then(() => {
                setLoading(false);    
            }).catch(() => {
                setLoading(false)
                alert('Error with returned data')
            })
            setLoading(false)
        }
    }

    async function submitAppyter() {    
        if (useDefaultFile != false || file != null) {
            setLoading(true);


            const formData = new FormData()
            let f = null;
            if (!useDefaultFile) {
                f = file;
                formData.append("tumor_expression", f, f.name);
            } else {
                formData.append("tumor_expression", 'https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/GSE49155-patient.tsv');
            }

            formData.append("tumor_transcript_level", level);
            formData.append("organism", 'Homo sapiens')
            formData.append("precomputed", precomputedBackground);
            formData.append("membrane_screener", membraneGenes);
            formData.append("normalize_to_background", backgroundDistribution);
            formData.append("proteomics_vis", showProteinProfiles);


            //const res = await fetch(`api/target_screener`, { method: 'POST', body: formData })
            var res = await fetch("https://appyters.maayanlab.cloud/Tumor_Gene_Target_Screener/", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            })
            const data = await res.json()
            console.log(data)
            console.log(data.session_id)
            const url = "https://appyters.maayanlab.cloud/Tumor_Gene_Target_Screener/" + data.session_id;
            window.open(url, "_blank")

            var res = await fetch("https://appyters.maayanlab.cloud/Tumor_Gene_Target_Screener/", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                },
                body: {session_id: data.session_id},
            })
            const status = await res.json()
        }
        
    }

    // For input file example table

    function createData(name, rep1, rep2, rep3) {
        return { name, rep1, rep2, rep3 };
    }
    
    const rows = [
        createData('Gene|Transcript 1', 0, 200, '...'),
        createData('Gene|Transcript 2', 5, 180, '...'),
        createData('...', '...', '...', '...')
    ];

    // For MUI Popover

    const [anchorEl, setAnchorEl] = React.useState(null);

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress size="10rem"/>
            </Backdrop>

            <div className={styles.mainDiv}>

                <Header/>

                <h1>Target Screener</h1>

                <div style={{flexWrap: 'wrap', gap: '50px'}} className={styles.horizontalFlexbox}>

                    <div className={styles.verticalFlexbox}>
                        <div className={styles.verticalFlexbox}>
                            <div style={{width: '350px'}}>Whether the tumor RNA-seq expression vectors is at the level of transcripts or genes:</div>
                            <ToggleButtonGroup
                                color="primary"
                                value={level}
                                exclusive
                                onChange={(event, newValue) => {if (newValue !== null) setLevel(!level) }}
                                >
                                <ToggleButton value={false}>Gene Level</ToggleButton>
                                <ToggleButton value={true}>Transcript Level</ToggleButton>
                            </ToggleButtonGroup>
                        </div>

                        <div className={styles.verticalFlexbox}>
                            <div>Normal tissue background:</div>

                            <div className={styles.horizontalFlexbox}>
                                <Box sx={{ width: 390 }}>
                                    <FormControl fullWidth>
                                        <Select
                                        value={precomputedBackground}
                                        onChange={(event) => setPrecomputedBackground(event.target.value)}
                                        >
                                            <MenuItem value={0}>GTEx (bulk RNA-seq) - Gene</MenuItem>
                                            <MenuItem value={1}>GTEx (bulk RNA-seq) - Transcript</MenuItem>
                                            <MenuItem value={2}>ARCHS4 (bulk RNA-seq) - Gene</MenuItem>
                                            <MenuItem value={3}>ARCHS4 (bulk RNA-seq) - Transcript</MenuItem>
                                            <MenuItem value={4}>Tabula Sapiens (scRNA-seq) - Gene</MenuItem>
                                            <MenuItem value={5}>Human Cell Atlas (scRNA-seq) - Gene</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </div>                                        
                        </div>
                    </div>

                    <div className={styles.verticalFlexbox}>

                        <div>Tumor RNA-seq expression vectors</div>

                        <div className={styles.horizontalFlexbox}>
                            <div style={{alignItems: 'flex-end'}} className={styles.verticalFlexbox}>
                                <Button onClick={() => setUseDefaultFile(true)} className={styles.darkOnHover} variant="outlined" endIcon={<HelpOutlineIcon />}>
                                    Load example file
                                </Button>
                                <a style={{textDecoration: 'none'}} href="files/GSE49155-patient.tsv" download="GSE49155-patient.tsv">
                                    <Button className={styles.darkOnHover} variant="outlined" endIcon={<DownloadIcon />}>
                                        Download example file
                                    </Button>
                                </a>
                                <Button className={styles.darkOnHover} onClick={(event) => {setAnchorEl(event.currentTarget)}} variant="outlined" endIcon={<HelpOutlineIcon />}>
                                    File specifications
                                </Button>
                                <Popover
                                    open={Boolean(anchorEl)}
                                    anchorEl={anchorEl}
                                    onClose={() => {setAnchorEl(null)}}
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
                            </div>
                            <div className={styles.verticalFlexbox}>
                                <input
                                    style={{ display: "none" }}
                                    id="fileUpload"
                                    type="file"
                                    onChange={(e) => {setUseDefaultFile(false); setFile(e.target.files[0])}}
                                />
                                <label htmlFor="fileUpload">
                                    <Button variant="contained" color="primary" component="span">
                                        Upload File
                                    </Button>
                                </label>
                                <Button onClick={() => {setUseDefaultFile(false); setFile(null)}} variant="contained" color="primary" component="span">
                                    Clear Chosen File             
                                </Button>
                            </div>
                        </div>

                        <div>Chosen file:</div>
                        <div>{file == null && useDefaultFile == false ? "None" : useDefaultFile == true ? "GSE49155-patient.tsv" : file.name}</div>

                    </div>

                    <div style={{alignItems: 'flex-start'}} className={styles.verticalFlexbox}>
                        <div className={styles.horizontalFlexbox}>
                            <ToggleButtonGroup
                                color="primary"
                                value={membraneGenes}
                                exclusive
                                onChange={(event, newValue) => {if (newValue !== null) setMembraneGenes(newValue) }}
                                >
                                <ToggleButton value={true}>Yes</ToggleButton>
                                <ToggleButton value={false}>No</ToggleButton>
                            </ToggleButtonGroup>
                            <div>Prioritize membrane genes</div>
                        </div>

                        <div className={styles.horizontalFlexbox}>
                            <ToggleButtonGroup
                                color="primary"
                                value={backgroundDistribution}
                                exclusive
                                onChange={(event, newValue) => {if (newValue !== null) setBackgroundDistribution(newValue) }}
                                >
                                <ToggleButton value={true}>Yes</ToggleButton>
                                <ToggleButton value={false}>No</ToggleButton>
                            </ToggleButtonGroup>
                            <div>Normalize to background distribution</div>
                        </div>

                        <div className={styles.horizontalFlexbox}>
                            <ToggleButtonGroup
                                color="primary"
                                value={showProteinProfiles}
                                exclusive
                                onChange={(event, newValue) => {if (newValue !== null) setShowProteinProfiles(newValue) }}
                                >
                                <ToggleButton value={true}>Yes</ToggleButton>
                                <ToggleButton value={false}>No</ToggleButton>
                            </ToggleButtonGroup>
                            <div>Show protein expression profiles of gene candidates</div>
                        </div>
                    </div>

                        

                </div>  
                
                <Button style={{marginTop: '25px'}} variant="contained" color="primary" onClick={submit}>Submit</Button>

                <Footer/>
            </div>
        </div>
      
    )
  }
