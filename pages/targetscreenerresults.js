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

export async function getServerSideProps(context) {
        
    return { 
        props: {
            membraneGenes: context.query.membraneGenes,
            backgroundDistribution: context.query.backgroundDistribution,
            showProteinProfiles: context.query.showProteinProfiles
        } 
    }

} 

export default function Page(props) {

    return (
        <div>
            <div>{props.membraneGenes}</div>
            <div>{props.backgroundDistribution}</div>
            <div>{props.showProteinProfiles}</div>
        </div>
    )
  }