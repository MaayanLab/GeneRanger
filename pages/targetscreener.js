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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router'

export default function Page() {

    const [level, setLevel] = React.useState('Gene Level');

    const [file, setFile] = React.useState("");

    const [membraneGenes, setMembraneGenes] = React.useState("Yes");
    const [backgroundDistribution, setBackgroundDistribution] = React.useState("Yes");
    const [showProteinProfiles, setShowProteinProfiles] = React.useState("Yes");

    const [precomputedBackground, setPrecomputedBackground] = React.useState(0);

    const router = useRouter();

    function submit() {
            
        if (file != "") {

            // setLoading(true);
            let href = {
                pathname: "targetscreenerresults",
                query: {
                    membraneGenes: membraneGenes,
                    backgroundDistribution: backgroundDistribution,
                    showProteinProfiles: showProteinProfiles
            }};
            router.push(href).then(() => {
                // setLoading(false);    
            })
            
        }
        
    }

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <h1>Target Screener</h1>

                <div>Tumor RNA-seq expression vectors</div>
                <div className={styles.horizontalFlexbox}>
                            <div>
                                <input
                                    style={{ display: "none" }}
                                    id="fileUpload"
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0].name)}
                                />
                                <label htmlFor="fileUpload">
                                    <Button variant="contained" color="primary" component="span">
                                    Upload
                                    </Button>
                                </label>
                                <div>{file}</div>
                                <div>Load example:</div>
                                <div>Download example: <a href="../files/GSE49155-patient.tsv" download="GSE49155-patient.tsv">GSE49155-lung-squamous-cell-carcinoma.tsv</a></div>
                            </div>
                </div>

                <div className={styles.horizontalFlexbox}>
                    <div>Whether the tumor RNA-seq expression vectors is at the level of transcripts or genes</div>
                    <ToggleButtonGroup
                        color="primary"
                        value={level}
                        exclusive
                        onChange={(event, newValue) => {if (newValue !== null) setLevel(newValue) }}
                        >
                        <ToggleButton value="Gene Level">Gene Level</ToggleButton>
                        <ToggleButton value="Transcript Level">Transcript Level</ToggleButton>
                    </ToggleButtonGroup>
                </div>

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
                                <MenuItem value={2}>ARCHS4 Anatomy (bulk RNA-seq) - Transcript</MenuItem>
                                <MenuItem value={3}>ARCHS4 Extra (bulk RNA-seq) - Gene</MenuItem>
                                <MenuItem value={4}>ARCHS4 Extra (bulk RNA-seq) - Transcript</MenuItem>
                                <MenuItem value={5}>Tabula Sapiens (scRNA-seq) - Gene</MenuItem>
                                <MenuItem value={6}>Human Cell Atlas (scRNA-seq) - Gene</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                    <div className={styles.horizontalFlexbox}>
                        <div>Prioritize membrane genes</div>
                        <ToggleButtonGroup
                            color="primary"
                            value={membraneGenes}
                            exclusive
                            onChange={(event, newValue) => {if (newValue !== null) setMembraneGenes(newValue) }}
                            >
                            <ToggleButton value="Yes">Yes</ToggleButton>
                            <ToggleButton value="No">No</ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    <div className={styles.horizontalFlexbox}>
                        <div>Normalize to background distribution</div>
                        <ToggleButtonGroup
                            color="primary"
                            value={backgroundDistribution}
                            exclusive
                            onChange={(event, newValue) => {if (newValue !== null) setBackgroundDistribution(newValue) }}
                            >
                            <ToggleButton value="Yes">Yes</ToggleButton>
                            <ToggleButton value="No">No</ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    <div className={styles.horizontalFlexbox}>
                        <div>Show protein expression profiles of gene candidates</div>
                        <ToggleButtonGroup
                            color="primary"
                            value={showProteinProfiles}
                            exclusive
                            onChange={(event, newValue) => {if (newValue !== null) setShowProteinProfiles(newValue) }}
                            >
                            <ToggleButton value="Yes">Yes</ToggleButton>
                            <ToggleButton value="No">No</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </div>

                <Button variant="contained" color="primary" onClick={submit}>Submit</Button>

                <Footer/>
            </div>
        </div>
      
    )
  }
