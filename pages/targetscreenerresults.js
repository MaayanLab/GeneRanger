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
import TargetResultTable from '../components/targetResultsTable';
import PlotResults from '../components/plotResults';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import TargetPlots from "../components/targetPlots";



export default function Results() {
    const router = useRouter();

    console.log(router.query)

    const state = router.query;

    console.log(state)

    var targets_dict = JSON.parse(state.targets);

    const targets = Object.keys(targets_dict)

    for (let i=0; i< targets.length; i++) {
        targets_dict[targets[i]] = JSON.stringify(targets_dict[targets[i]])
    }

    

    return (
    
        <div style={{position: 'relative', minHeight: '100vh'}}>

        <Head/>

        <div className={styles.mainDiv}>

            <Header/>

            <h1>Target Screener Results</h1>

            <p>This pipeline uses RNA-seq expression data for a tumor and identifies over-expressed proteins verses a baseline dataset of normal tissues such those in GTEx or ARCHS4. It then prioritizes candidates by significance and targetability.</p>
            <TargetResultTable results={state.data_head}/>

            <TargetResultTable results={state.bg_head}/>

            <PlotResults results={state.dge}></PlotResults>

            <TargetResultTable results={state.dge_table}/>

            <TargetResultTable results={state.available}/>

            {
                targets.map((t) => {
                    return (
                    <>
                    <TargetPlots results={targets_dict[t]} target={t}></TargetPlots>
                    </>
                )
                })
            }
            <Footer/>
        </div>
    </div>
    )
}