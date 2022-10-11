import { Responsive, WidthProvider } from "react-grid-layout";
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../styles/TumorGeneTargetScreener.module.css';
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

export default function Page() {

    const [level, setLevel] = React.useState('Gene Level');
    const [uploadOption, setUploadOption] = React.useState('Upload');

    const [upload, setUpload] = React.useState(true);
    const [locate, setLocate] = React.useState(false);
    const [passthrough, setPassthrough] = React.useState(false);

    const [file, setFile] = React.useState("");

    const [tissueBackground, setTissueBackground] = React.useState("Precomputed");

    const [backgroundLevel, setBackgroundLevel] = React.useState("Gene Level");
    const [rnaSeqType, setRnaSeqType] = React.useState("Bulk RNA-seq");
    
    const [backgroundUploadOption, setBackgroundUploadOption] = React.useState('Upload');
    const [backgroundFile, setBackgroundFile] = React.useState("");

    const [membraneGenes, setMembraneGenes] = React.useState("Yes");
    const [backgroundDistribution, setBackgroundDistribution] = React.useState("Yes");
    const [showProteinProfiles, setShowProteinProfiles] = React.useState("Yes");

    const [precomputedBackground, setPrecomputedBackground] = React.useState(0);

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <h1>Tumor Gene Target Screener</h1>

                <div>Tumor RNA-seq expression vectors</div>
                <div className={styles.horizontalFlexbox}>
                    <ToggleButtonGroup
                        color="primary"
                        value={uploadOption}
                        exclusive
                        orientation={'vertical'}
                        onChange={(event, newValue) => {if (newValue !== null) setUploadOption(newValue) }}
                        >
                        <ToggleButton value="Upload">Upload</ToggleButton>
                        {/* <ToggleButton value="Locate">Locate</ToggleButton> */}
                        <ToggleButton value="Passthrough">Passthrough</ToggleButton>
                    </ToggleButtonGroup>
                    {
                        uploadOption === 'Upload' &&
                            (
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
                                <div>Download example:</div>
                            </div>
                            )
                    }
                    {
                        uploadOption === 'Locate' &&
                        (
                            <></>
                        )
                    }
                    {
                        uploadOption === 'Passthrough' &&
                            (
                                <div>
                                    <div>URI Passthrough: This allows you to pass the file through a number of different URI protocols. Supported protocols include: drs (GA4GH), s3, gs, ftp, http, &amp; https</div>
                                    <div>Uniform Resource Identifier:</div>
                                    <TextField variant="outlined" />
                                </div>
                            )
                    }
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
                    <ToggleButtonGroup
                        color="primary"
                        value={tissueBackground}
                        exclusive
                        orientation={'vertical'}
                        onChange={(event, newValue) => {if (newValue !== null) setTissueBackground(newValue) }}
                        >
                        <ToggleButton value="Precomputed">Precomputed</ToggleButton>
                        <ToggleButton value="Custom">Custom</ToggleButton>
                    </ToggleButtonGroup>

                    {
                        tissueBackground == "Precomputed" &&
                        (
                            <>
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
                                            <MenuItem value={5}>ARCHS4 New (bulk RNA-seq) - Gene</MenuItem>
                                            <MenuItem value={6}>ARCHS4 New (bulk RNA-seq) - Transcript</MenuItem>
                                            <MenuItem value={7}>Tabula Sapiens (scRNA-seq) - Gene</MenuItem>
                                            <MenuItem value={8}>Human Cell Atlas (scRNA-seq) - Gene</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </>
                        )
                    }
                    {
                        tissueBackground == "Custom" &&
                        (
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <div className={styles.horizontalFlexbox}>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={backgroundUploadOption}
                                        exclusive
                                        orientation={'vertical'}
                                        onChange={(event, newValue) => {if (newValue !== null) setBackgroundUploadOption(newValue) }}
                                        >
                                        <ToggleButton value="Upload">Upload</ToggleButton>
                                        <ToggleButton value="Passthrough">Passthrough</ToggleButton>
                                    </ToggleButtonGroup>
                                    {
                                        backgroundUploadOption === 'Upload' &&
                                            (
                                            <div>
                                                <input
                                                    style={{ display: "none" }}
                                                    id="backgroundFileUpload"
                                                    type="file"
                                                    onChange={(e) => setBackgroundFile(e.target.files[0].name)}
                                                />
                                                <label htmlFor="backgroundFileUpload">
                                                    <Button variant="contained" color="primary" component="span">
                                                    Upload
                                                    </Button>
                                                </label>
                                                <div>{backgroundFile}</div>
                                                <div>Load example:</div>
                                                <div>Download example:</div>
                                            </div>
                                            )
                                    }
                                    {
                                        backgroundUploadOption === 'Locate' &&
                                        (
                                            <></>
                                        )
                                    }
                                    {
                                        backgroundUploadOption === 'Passthrough' &&
                                            (
                                                <div>
                                                    <div>URI Passthrough: This allows you to pass the file through a number of different URI protocols. Supported protocols include: drs (GA4GH), s3, gs, ftp, http, &amp; https</div>
                                                    <div>Uniform Resource Identifier:</div>
                                                    <TextField variant="outlined" />
                                                </div>
                                            )
                                    }
                                </div>
                                <div>
                                    <div>Whether this file is at the level of transcripts or genes</div>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={backgroundLevel}
                                        exclusive
                                        onChange={(event, newValue) => {if (newValue !== null) setBackgroundLevel(newValue) }}
                                        >
                                        <ToggleButton value="Transcript Level">Transcript Level</ToggleButton>
                                        <ToggleButton value="Gene Level">Gene Level</ToggleButton>
                                    </ToggleButtonGroup>
                                </div>
                                <div>
                                    <div>Whether this file is scRNA-seq or bulk RNA-seq</div>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={rnaSeqType}
                                        exclusive
                                        onChange={(event, newValue) => {if (newValue !== null) setRnaSeqType(newValue) }}
                                        >
                                        <ToggleButton value="scRNA-seq">scRNA-seq</ToggleButton>
                                        <ToggleButton value="Bulk RNA-seq">Bulk RNA-seq</ToggleButton>
                                    </ToggleButtonGroup>
                                </div>
                            </div>
                        )
                    }
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

                <Footer/>
            </div>
        </div>
      
    )
  }
