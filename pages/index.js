import { Responsive, WidthProvider } from "react-grid-layout";
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../styles/Main.module.css';
import { FormGroup, FormControlLabel, Switch, TextField, Autocomplete, Container, Tooltip, tooltipClasses, CircularProgress } from '@mui/material';
import genes from '../json/genes.json';
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import GraphMissing from '../components/graphMissing';
import Zoom from '@mui/material/Zoom';
import Backdrop from '@mui/material/Backdrop';

const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});

export async function getServerSideProps() {

    const prisma = new PrismaClient();

    let all_db_data = {};

    let defaultGene = 'A2M';


    const gtex_transcriptomics = await prisma.gtex_transcriptomics.findMany({
        where: {
            name: defaultGene,
        },
    });
    Object.assign(all_db_data, {gtex_transcriptomics: gtex_transcriptomics});

    const archs4 = await prisma.archs4.findMany({
        where: {
            name: defaultGene,
        },
    });
    Object.assign(all_db_data, {archs4: archs4});

    const tabula_sapiens = await prisma.tabula_sapiens.findMany({
        where: {
            name: defaultGene,
        },
    });
    Object.assign(all_db_data, {tabula_sapiens: tabula_sapiens});

    const hpm = await prisma.hpm.findMany({
        where: {
            gene: defaultGene,
        },
    });
    Object.assign(all_db_data, {hpm: hpm});

    const hpa = await prisma.hpa.findMany({
        where: {
            gene_name: defaultGene,
        },
    });
    Object.assign(all_db_data, {hpa: hpa});

    const gtex_proteomics = await prisma.gtex_proteomics.findMany({
        where: {
            gene_id: defaultGene,
        },
    });
    Object.assign(all_db_data, {gtex_proteomics: gtex_proteomics});

    
    return { 
        props: {
            gene: defaultGene,
            databases: ["true", "true", "true", "true", "true", "true"], 
            all_db_data: all_db_data
        } 
    }

}

export default function Dashboard(props) {

    let gtex_transcriptomics = null;
    let archs4 = null;
    let tabula_sapiens = null;
    let hpm = null;
    let hpa = null;
    let gtex_proteomics = null;

    // Replaces underscores and periods with spaces
    function processNames(names) {
        return names.map(name => name.replace(/_+/g, ' ').replaceAll('.', ' ').trim());
    }
  
    if (props.databases[0] == "true") {

        let data = props.all_db_data.gtex_transcriptomics;

        if (data.length != 0) {

            let mean_index = 1;
            let sd_index = 2;
            let min_index = 3;
            let q1_index = 4;
            let median_index = 5;
            let q3_index = 6;
            let max_index = 7;

            let q1 = Object.values(data[q1_index]).slice(3);
            let q3 = Object.values(data[q3_index]).slice(3);
            let min = Object.values(data[min_index]).slice(3);
            let max = Object.values(data[max_index]).slice(3);
            let IQR = Object.values(data[q3_index]).slice(3).map((value, index) => value - q1[index]);
            let lowerfence = min.map((value, index) => Math.max(value, q1.map((value, index) => value - (1.5 * IQR[index]))[index]));
            let upperfence = max.map((value, index) => Math.min(value, q3.map((value, index) => value + (1.5 * IQR[index]))[index]));
            let names = processNames(Object.keys(data[q1_index]).slice(3));
            let sd = Object.values(data[sd_index]).slice(3);
            let median =Object.values(data[median_index]).slice(3);
            let mean = Object.values(data[mean_index]).slice(3)

            let arrays = [];
            for (let i = 0; i < mean.length; i++) {
                arrays.push({'q1': q1[i], 'median': median[i], 'q3': q3[i], 'mean': mean[i], 'sd': sd[i], 'lowerfence': lowerfence[i], 'upperfence': upperfence[i], 'name': names[i]});
            }

            arrays.sort((a, b) => a.mean - b.mean);

            for (let i = 0; i < mean.length; i++) {

                q1[i] = arrays[i].q1;
                median[i] = arrays[i].median;
                q3[i] = arrays[i].q3;
                mean[i] = arrays[i].mean;
                sd[i] = arrays[i].sd;
                lowerfence[i] = arrays[i].lowerfence;
                upperfence[i] = arrays[i].upperfence;
                names[i] = arrays[i].name;

            }

            gtex_transcriptomics = {
                q1: q1,
                median: median,
                q3: q3,
                mean: mean,
                sd: sd,
                lowerfence: lowerfence,
                upperfence: upperfence,
                y: names,
                orientation: 'h',
                type: 'box'
            }
        }
    }
    
    if (props.databases[1] == "true") {

        let data = props.all_db_data.archs4;

        if (data.length != 0) {

            let mean_index = 1;
            let sd_index = 2;
            let min_index = 3;
            let max_index = 4;
            let q1_index = 5;
            let median_index = 6;
            let q3_index = 7;

            let q1 = Object.values(data[q1_index]).slice(3);
            let q3 = Object.values(data[q3_index]).slice(3);
            let min = Object.values(data[min_index]).slice(3);
            let max = Object.values(data[max_index]).slice(3);
            let IQR = Object.values(data[q3_index]).slice(3).map((value, index) => value - q1[index]);
            let lowerfence = min.map((value, index) => Math.max(value, q1.map((value, index) => value - (1.5 * IQR[index]))[index]));
            let upperfence = max.map((value, index) => Math.min(value, q3.map((value, index) => value + (1.5 * IQR[index]))[index]));
            let names = processNames(Object.keys(data[q1_index]).slice(3));
            let median = Object.values(data[median_index]).slice(3);
            let mean = Object.values(data[mean_index]).slice(3);
            let sd = Object.values(data[sd_index]).slice(3);

            let arrays = [];
            for (let i = 0; i < mean.length; i++) {
                arrays.push({'q1': q1[i], 'median': median[i], 'q3': q3[i], 'mean': mean[i], 'sd': sd[i], 'lowerfence': lowerfence[i], 'upperfence': upperfence[i], 'name': names[i]});
            }

            arrays.sort((a, b) => a.mean - b.mean);

            for (let i = 0; i < mean.length; i++) {

                q1[i] = arrays[i].q1;
                median[i] = arrays[i].median;
                q3[i] = arrays[i].q3;
                mean[i] = arrays[i].mean;
                sd[i] = arrays[i].sd;
                lowerfence[i] = arrays[i].lowerfence;
                upperfence[i] = arrays[i].upperfence;
                names[i] = arrays[i].name;

            }

            archs4 = {
                q1: q1,
                median: median,
                q3: q3,
                mean: mean,
                sd: sd,
                lowerfence: lowerfence,
                upperfence: upperfence,
                y: names,
                orientation: 'h',
                type: 'box'
            }
        }

    }

    if (props.databases[2] == "true") {

        let data = props.all_db_data.tabula_sapiens;

        if (data.length != 0) {

            let mean_index = 1;
            let sd_index = 2;
            let min_index = 3;
            let q1_index = 4;
            let median_index = 5;
            let q3_index = 6;
            let max_index = 7;

            let q1 = Object.values(data[q1_index]).slice(3);
            let q3 = Object.values(data[q3_index]).slice(3);
            let min = Object.values(data[min_index]).slice(3);
            let max = Object.values(data[max_index]).slice(3);
            let IQR = Object.values(data[q3_index]).slice(3).map((value, index) => value - q1[index]);
            let lowerfence = min.map((value, index) => Math.max(value, q1.map((value, index) => value - (1.5 * IQR[index]))[index]));
            let upperfence = max.map((value, index) => Math.min(value, q3.map((value, index) => value + (1.5 * IQR[index]))[index]));
            let names = processNames(Object.keys(data[q1_index]).slice(3));
            let median = Object.values(data[median_index]).slice(3);
            let mean = Object.values(data[mean_index]).slice(3);
            let sd = Object.values(data[sd_index]).slice(3);

            let arrays = [];
            for (let i = 0; i < mean.length; i++) {
                arrays.push({'q1': q1[i], 'median': median[i], 'q3': q3[i], 'mean': mean[i], 'sd': sd[i], 'lowerfence': lowerfence[i], 'upperfence': upperfence[i], 'name': names[i]});
            }

            arrays.sort((a, b) => a.mean - b.mean);

            for (let i = 0; i < mean.length; i++) {

                q1[i] = arrays[i].q1;
                median[i] = arrays[i].median;
                q3[i] = arrays[i].q3;
                mean[i] = arrays[i].mean;
                sd[i] = arrays[i].sd;
                lowerfence[i] = arrays[i].lowerfence;
                upperfence[i] = arrays[i].upperfence;
                names[i] = arrays[i].name;

            }

            tabula_sapiens = {
                q1: q1,
                median: median,
                q3: q3,
                mean: mean,
                sd: sd,
                lowerfence: lowerfence,
                upperfence: upperfence,
                y: names,
                orientation: 'h',
                type: 'box'
            }
        }

    }
  
    if (props.databases[3] == "true") {

      let data = props.all_db_data.hpm;

      if (data.length != 0) {

          let values = [];
          let tissues = [];

          let arrays = [];
          for (let i = 0; i < data.length; i++) {
              arrays.push({'value': data[i].value, 'tissue': data[i].tissue});
          }

          arrays.sort((a, b) => a.value - b.value);

          for (let i = 0; i < arrays.length; i++) {
              
              values[i] = arrays[i].value;
              tissues[i] = arrays[i].tissue;

          }

          hpm = {
              x: values,
              y: processNames(tissues),
              type: "scatter",
              mode: "markers",
              marker: { color: '#1f77b4' },
            }
      }
    }

    if (props.databases[4] == "true") {

      let data = props.all_db_data.hpa;

      if (data.length != 0) {

          let levels = [];
          let tissue_and_cells = [];

          let not_detected = [];
          let low = [];
          let medium = [];
          let high = [];
          for (let i = 0; i < data.length; i++) {
              if (data[i].level == "Not detected") {
                  not_detected.push({'level': data[i].level, 'tissue_and_cell': data[i].tissue + ', ' + data[i].cell_type});
              } else if (data[i].level == "Low") {
                  low.push({'level': data[i].level, 'tissue_and_cell': data[i].tissue + ', ' + data[i].cell_type});
              } else if (data[i].level == "Medium") {
                  medium.push({'level': data[i].level, 'tissue_and_cell': data[i].tissue + ', ' + data[i].cell_type});
              } else {
                  high.push({'level': data[i].level, 'tissue_and_cell': data[i].tissue + ', ' + data[i].cell_type});
              }
          }

          let combined = not_detected.concat(low, medium, high);

          for (let i = 0; i < combined.length; i++) {

              levels[i] = combined[i].level;
              tissue_and_cells[i] = combined[i].tissue_and_cell;

          }

          hpa = {
              x: levels,
              y: tissue_and_cells,
              // category_orders: {"Level": ["Not detected", "Low", "Medium", "High"]}, 
              type: "scatter",
              mode: "markers",
              marker: { color: '#1f77b4' },
            }
      }

    }

    if (props.databases[5] == "true") {

        let data = props.all_db_data.gtex_proteomics;

        if (data.length != 0) {

            let tissues = [];
            let temp = {};
            gtex_proteomics = [];

            for (let i = 0; i < Object.keys(data).length; i++) {
                if (!tissues.includes(data[i].tissue)) {
                    tissues.push(data[i].tissue);
                    if (temp.x != null) {
                        gtex_proteomics.push(temp);
                    }
                    temp = {name: data[i].tissue, type: 'box', x: [data[i].value], marker: {color: '#1f77b4'}};
                } else {
                    temp.x.push(data[i].value);
                }
            }
            gtex_proteomics.push(temp);

            // Sorting

            for (let i = 0; i < Object.keys(gtex_proteomics).length; i++) {
                let mean = gtex_proteomics[i].x.reduce((a, b) => a + b, 0) / gtex_proteomics[i].x.length;
                gtex_proteomics[i]['mean'] = mean;
            }

            gtex_proteomics.sort((a, b) => a.mean - b.mean);
        }

    }

    let databases = [true, true, true, true, true, true];

    function updateDatabases(index) {
        let updatedArray = databases;
        updatedArray[index] = !updatedArray[index];
        databases = updatedArray;
    }

    const router = useRouter();

    function submitGene (gene) {
            
      if (gene != null) {
        setLoading(true);
        let href = {
            pathname: "gene/[gene]",
            query: {
                gene: gene,
                databases: databases
        }};
        router.push(href).then(() => {
          setLoading(false);    
        })
      }
        
    }

    // For MUI tabs

    function TabPanel(props) {
        const {children, value, index, classes, ...other} = props;
    
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Container>
                        <Box>
                            {children}
                        </Box>
                    </Container>
                )}
            </div>
        );
    }
      
    TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    };
    
    // function a11yProps(index) {
    //   return {
    //     id: `simple-tab-${index}`,
    //     'aria-controls': `simple-tabpanel-${index}`,
    //   };
    // }

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const CustomTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
      textTransform: 'none',
    }));

    let currTabIndex = -1;
    
    function getNextIndex () {
        console.log(value);
        currTabIndex++;
        return currTabIndex;
    }

    // For MUI tooltip

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: '#8eaabe',
          width: 75,
          border: '2px solid black',
        },
        [`& .${tooltipClasses.arrow}`]: {
            color: 'black',
        }
    }));

    // For MUI loading icon

    const [loading, setLoading] = React.useState(false);

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

                <div style={{display: 'flex', justifyContent: 'flex-start', width: '100%', paddingBottom: '150px'}}>

                    <div className={styles.dbGroup}>
                        <div style={{marginBottom: '15px'}}>
                            {/* <h2 style={{marginTop: '0px', marginBottom: '10px'}}>Insert gene of interest:</h2> */}
                            <Autocomplete
                                disablePortal
                                options={ genes }
                                sx={{ width: 400 }}
                                onChange={(event, value) => {submitGene(value)}}
                                renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
                                />
                                {/* {
                                loading == true ? <div style={{display: 'flex', justifyContent: 'center', marginTop: '15px'}}><CircularProgress/></div> : <></>
                                } */}
                        </div>
                        <div style={{width: '400px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#aec2d0', borderRadius: '5px', paddingTop: '20px', paddingBottom: '20px'}}>

                          <div>
                              <h3 style={{margin: '0'}}>Transcriptomics</h3>
                              <FormGroup style={{alignItems: 'center'}}>

                                  <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => updateDatabases(0)} defaultChecked />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} src="/images/GTEx.png" alt="GTEx Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://gtexportal.org/home/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://www.nature.com/articles/ng.2653" target="_blank" rel="noopener noreferrer">Publication</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>

                                  <div className={styles.logoDesc}>A database designed to study the relationship between genetic variation and gene expression across multiple tissues.  Each tissue’s RNA expression is represented by a box plot.</div>

                                  <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => updateDatabases(1)} defaultChecked />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} src="/images/archs4.png" alt="archs4 Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://www.nature.com/articles/s41467-018-03751-6" target="_blank" rel="noopener noreferrer">Publication</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                  
                                  <div className={styles.logoDesc}>RNA-seq data from many public sources conveniently compiled into a single database.  Each tissue/cell’s RNA expression is represented by a box plot.</div>
                                  
                                  <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => updateDatabases(2)} defaultChecked />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{borderRadius: '8px'}} src="/images/tabula_sapiens.png" alt="Tabula Sapiens Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">Publication</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                  
                                  <div className={styles.logoDesc}>An atlas of RNA-seq data for over 400 cell types created with single-cell transcriptomics.  Each tissue/cell’s RNA expression is represented by a box plot.</div>

                              </FormGroup>
                            </div>
                      
                            <div>
                              <h3 style={{margin: '0'}}>Proteomics</h3>
                              <FormGroup style={{alignItems: 'center'}}>

                                  <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => updateDatabases(3)} defaultChecked />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{width: '200px', marginRight: '0'}} src="/images/HPM.gif" alt="HPM Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">Publication</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                  
                                  <div className={styles.logoDesc}>A draft map of the human proteome created with Fourier transform mass spectrometry.  Data are displayed as average spectral counts.</div>
                                  
                                  <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => updateDatabases(4)} defaultChecked />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} style={{width: '200px', padding: '10px', marginLeft: '0px', marginRight: '-20px', backgroundColor: '#8eaabe', borderRadius: '5px'}} src="/images/HPA.svg" alt="HPA Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">Publication</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                  
                                  <div className={styles.logoDesc}>A map of protein expression across 32 human tissues created with antibody profiling.  Proteins are categorized as either “not detected”, “low”, “medium”, or “high”.</div>
                                  
                                  <FormControlLabel 
                                    className={styles.formItem} 
                                    control={<Switch onChange={() => updateDatabases(5)} defaultChecked />} 
                                    label={
                                        <div className={styles.dbLogo}>
                                            <img className={styles.databaseLogo} src="/images/GTEx.png" alt="GTEx Logo"/>
                                            <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                                <div className={styles.tooltipText}><a href="https://gtexportal.org/home/" target="_blank" rel="noopener noreferrer">Website</a> <br/> <a href="https://www.nature.com/articles/ng.2653" target="_blank" rel="noopener noreferrer">Publication</a></div>}>
                                                <IconButton><InfoIcon color='info'/></IconButton>
                                            </HtmlTooltip>
                                        </div>
                                    } 
                                    labelPlacement="start"/>
                                  
                                  <div className={styles.logoDesc}>A database designed to study the relationship between genetic variation and gene expression across multiple tissues.  Data are displayed as protein log-transformed relative abundance in box-plot form.</div>

                              </FormGroup>
                            </div>
                            
                        </div>
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: '10px', gap: '10px', width: '100%'}}>
                        
                      <div>
                        <Box sx={{ width: '100%' }}>
                            <Box>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    {
                                        props.databases[0] === "true" 

                                        && 

                                        (<CustomTab label="GTEx Transcriptomics"  />)
                                    }
                                    {
                                        props.databases[1] === "true" 

                                        && 

                                        (<CustomTab label="ARCHS4" />)
                                    }
                                    {
                                        props.databases[2] === "true" 

                                        && 

                                        (<CustomTab label="Tabula Sapiens" />)
                                    }
                                    {
                                        props.databases[3] === "true" 

                                        && 

                                        (<CustomTab label="HPM" />)
                                    }
                                    {
                                        props.databases[4] === "true" 

                                        && 

                                        (<CustomTab label="HPA"  />)
                                    }
                                    {
                                        props.databases[5] === "true" 

                                        && 

                                        (<CustomTab label="GTEx Proteomics"  />)
                                    } 
                                </Tabs>
                            </Box>
                            {
                              props.databases[0] === "true" 
                              
                              &&
                                  
                              (
                                  <TabPanel value={value} index={getNextIndex()}>
                                      {
                                          gtex_transcriptomics != null 
                                              ? 
                                                  <div id="gtex_transcriptomics">
                                                      <Plot
                                                          data={[gtex_transcriptomics]}
                                                          layout={{width: '800', height: '1500', title: props.gene + ' (RNA-seq) GTEx', yaxis: {automargin: true},
                                                          xaxis: {
                                                              title: {
                                                              text: 'RNA counts',
                                                              }
                                                          }}}
                                                          config={{responsive: true}}
                                                          id={"gtex_transcriptomics"}
                                                          // style={{paddingBottom: '75px'}}
                                                      />
                                                  </div>
                                                  
                                              : 
                                                  <GraphMissing/>
                                      }
                                  </TabPanel>
                              )
                          }
                          {
                              props.databases[1] === "true" 
                              
                              &&
                                  
                              (
                                  <TabPanel value={value} index={getNextIndex()}>
                                      {
                                          archs4 != null 
                                              ? 
                                                  <div id="archs4">
                                                      <Plot
                                                          data={[archs4]}
                                                          layout={{width: '800', height: '13000', title: props.gene + ' (RNA-seq) ARCHS4',
                                                          yaxis: {
                                                          automargin: true
                                                          },
                                                          xaxis: {
                                                              title: {
                                                              text: 'RNA counts',
                                                              }
                                                          }}}
                                                          // style={{paddingBottom: '75px'}}
                                                      />
                                                  </div>
                                                  
                                              : 
                                                  <GraphMissing/>
                                      }
                                  </TabPanel>
                              )
                          }
                          {
                              props.databases[2] === "true" 
                              
                              &&
                                  
                              (
                                  <TabPanel value={value} index={getNextIndex()}>
                                      {
                                          tabula_sapiens != null 
                                              ? 
                                                  <div id="tabula_sapiens">
                                                      <Plot
                                                          data={[tabula_sapiens]}
                                                          layout={{width: '800', height: '13000', title: props.gene + ' (RNA-seq) Tabula Sapiens',
                                                          yaxis: {
                                                          automargin: true
                                                          },
                                                          xaxis: {
                                                              title: {
                                                              text: 'RNA counts',
                                                              }
                                                          }}}
                                                          // style={{paddingBottom: '75px'}}
                                                      />
                                                  </div>
                                                  
                                              : 
                                                  <GraphMissing/>
                                      }
                                  </TabPanel>
                              )
                          }
                          {
                              props.databases[3] === "true" 
                              
                              &&
                                  
                              (
                                  <TabPanel value={value} index={getNextIndex()}>
                                      {
                                          hpm != null 
                                              ? 
                                                  <div id="hpm">
                                                      <Plot
                                                          data={[hpm]}
                                                          layout={{width: '800', height: '1000', title: props.gene + ' (HPM)',
                                                          yaxis: {
                                                          automargin: true
                                                          },
                                                          xaxis: {
                                                              title: {
                                                              text: 'Average Spectral Counts',
                                                              }
                                                          }
                                                          }}
                                                          // style={{paddingBottom: '75px'}}
                                                      />
                                                  </div>
                                              : 
                                                  <GraphMissing/>
                                      }
                                  </TabPanel>
                              )
                          }
                          {
                              props.databases[4] === "true" 
                              
                              &&
                                  
                              (
                                  <TabPanel value={value} index={getNextIndex()}>
                                      {
                                          hpa != null 
                                              ? 
                                                  <div id="hpa">
                                                      <Plot
                                                      data={[hpa]}
                                                      layout={{width: '800', height: '1500', title: props.gene + ' (HPA)',
                                                      yaxis: {
                                                      automargin: true
                                                      },
                                                      xaxis: {
                                                          "categoryorder": "array",
                                                          "categoryarray":  ["Not detected", "Low", "Medium", "High"],
                                                          title: {
                                                              text: 'Tissue Expression Level',
                                                          }
                                                      }
                                                      }}  
                                                      // style={{paddingBottom: '75px'}}
                                                      />
                                                  </div>
                                              : 
                                                  <GraphMissing/>
                                      }
                                  </TabPanel>
                              )
                          }
                          {
                              props.databases[5] === "true" 
                              
                              &&
                                  
                              (
                                  <TabPanel value={value} index={getNextIndex()}>
                                      {
                                          gtex_proteomics != null 
                                              ? 
                                                  <div id="gtex_proteomics">
                                                      <Plot
                                                          data={gtex_proteomics}
                                                          layout={{width: '800', height: '1500', title: props.gene + ' (GTEx Proteomics)',
                                                          showlegend: false,
                                                          yaxis: {
                                                          automargin: true
                                                          },
                                                          xaxis: {
                                                              title: {
                                                                  text: 'log2(relative abundance)',
                                                              }
                                                          }
                                                          }}
                                                          // style={{paddingBottom: '75px'}}
                                                      />
                                                  </div>
                                              : 
                                                  <GraphMissing/>
                                      }
                                  </TabPanel>
                              )
                          }
                        </Box>
                      </div>
                    </div>
                </div>
            
                <Footer/>

            </div>
        </div>
      
    )
  }
