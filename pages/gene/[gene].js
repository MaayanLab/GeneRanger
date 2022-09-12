import { Responsive, WidthProvider } from "react-grid-layout";
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState } from 'react';
import styles from '../../styles/Main.module.css';
import { FormGroup, FormControlLabel, Switch, TextField, Button, Autocomplete } from '@mui/material';
import genes from '../../json/genes.json';
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Footer from '../../components/footer';
import Header from '../../components/header';
import Head from '../../components/head';

const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});

export async function getServerSideProps(context) {

    const prisma = new PrismaClient();

    let all_db_data = {};

    if (context.query.databases[0] == "true") {
        const gtex_transcriptomics = await prisma.gtex_transcriptomics.findMany({
            where: {
                name: context.query.gene,
            },
        });
        Object.assign(all_db_data, {gtex_transcriptomics: gtex_transcriptomics});
    }
    
    if (context.query.databases[1] == "true") {
        const archs4 = await prisma.archs4.findMany({
            where: {
                name: context.query.gene,
            },
        });
        Object.assign(all_db_data, {archs4: archs4});
    }

    if (context.query.databases[2] == "true") {
        const tabula_sapiens = await prisma.tabula_sapiens.findMany({
            where: {
                name: context.query.gene,
            },
        });
        Object.assign(all_db_data, {tabula_sapiens: tabula_sapiens});
    }

    if (context.query.databases[3] == "true") {
        const hpm = await prisma.hpm.findMany({
            where: {
                gene: context.query.gene,
            },
        });
        Object.assign(all_db_data, {hpm: hpm});
    }

    if (context.query.databases[4] == "true") {
        const hpa = await prisma.hpa.findMany({
            where: {
                gene_name: context.query.gene,
            },
        });
        Object.assign(all_db_data, {hpa: hpa});
    }

    if (context.query.databases[5] == "true") {
        const gtex_proteomics = await prisma.gtex_proteomics.findMany({
            where: {
                gene_id: context.query.gene,
            },
        });
        Object.assign(all_db_data, {gtex_proteomics: gtex_proteomics});
    }
    
    return { 
        props: {
            gene: context.query.gene,
            databases: context.query.databases, 
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

            gtex_transcriptomics = {
                q1: q1,
                median: Object.values(data[median_index]).slice(3),
                q3: q3,
                mean: Object.values(data[mean_index]).slice(3),
                sd: Object.values(data[sd_index]).slice(3),
                lowerfence: lowerfence,
                upperfence: upperfence,
                y: Object.keys(data[q1_index]).slice(3),
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

            archs4 = {
                q1: q1,
                median: Object.values(data[median_index]).slice(3),
                q3: q3,
                mean: Object.values(data[mean_index]).slice(3),
                sd: Object.values(data[sd_index]).slice(3),
                lowerfence: lowerfence,
                upperfence: upperfence,
                y: Object.keys(data[q1_index]).slice(3),
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

            tabula_sapiens = {
                q1: q1,
                median: Object.values(data[median_index]).slice(3),
                q3: q3,
                mean: Object.values(data[mean_index]).slice(3),
                sd: Object.values(data[sd_index]).slice(3),
                lowerfence: lowerfence,
                upperfence: upperfence,
                y: Object.keys(data[q1_index]).slice(3),
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

            for (let i = 0; i < data.length; i++) {
                values.push(data[i].value)
                tissues.push(data[i].tissue)
            }

            hpm = {
                x: values,
                y: tissues,
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

            for (let i = 0; i < data.length; i++) {
                levels.push(data[i].level)
                tissue_and_cells.push(data[i].tissue + ', ' + data[i].cell_type)
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
        }

    }

    const [databases, setDatabases] = useState([true, true, true, true, true, true]);

    function updateDatabases(index) {
        let updatedArray = [...databases];
        updatedArray[index] = !updatedArray[index];
        setDatabases(updatedArray);
    }

    const router = useRouter();

    function submitGene (gene) {
            console.log(gene)
            if (gene != null) {
            let href = {
                pathname: "[gene]",
                query: {
                    gene: gene,
                    databases: databases
            }};
            router.push(href)
        } else {
        }
        
    }

    // For MUI tabs

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
      
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            {value === index && (
              <Box sx={{ p: 3 }}>
                <Typography>{children}</Typography>
              </Box>
            )}
          </div>
        );
      }
      
      TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
      };
      
      function a11yProps(index) {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
      }

      const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

            <Header/>

            <div style={{display: 'flex', justifyContent: 'flex-start', width: '100%'}}>

                <div className={styles.dbGroup}>
                    <div>
                        <Autocomplete
                            disablePortal
                            options={ genes }
                            sx={{ width: 300 }}
                            onChange={(event, value) => {submitGene(value)}}
                            renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
                            />
                            {/* {
                            loading == true ? <div style={{display: 'flex', justifyContent: 'center', marginTop: '15px'}}><CircularProgress/></div> : <></>
                            } */}
                    </div>
                    <h2>Transcriptomics</h2>
                    <FormGroup style={{alignItems: 'center'}}>
                        <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(0)} defaultChecked />} label={<><a className={styles.logoLink} href="https://gtexportal.org/home/" target="_blank" rel="noopener noreferrer"><img className={styles.t_databaseLogo} src="/images/GTEx.png" alt="GTEx Logo"/></a></>} labelPlacement="start"/>
                        <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(1)} defaultChecked />} label={<><a className={styles.logoLink} href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer"><img className={styles.t_databaseLogo} src="/images/archs4.png" alt="archs4 Logo"/></a></>} labelPlacement="start"/>
                        <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(2)} defaultChecked />} label={<><a className={styles.logoLink} href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer"><img className={styles.t_databaseLogo} style={{borderRadius: '8px'}} src="/images/tabula_sapiens.png" alt="Tabula Sapiens Logo"/></a></>} labelPlacement="start"/>
                    </FormGroup>
                    <h2>Proteomics</h2>
                    <FormGroup style={{alignItems: 'center'}}>
                        <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(3)} defaultChecked />} label={<><a className={styles.logoLink} href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer"><img className={styles.p_databaseLogo} src="/images/HPM.gif" alt="HPM Logo"/></a></>} labelPlacement="start"/>
                        <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(4)} defaultChecked />} label={<><a className={styles.logoLink} href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer"><img className={styles.p_databaseLogo} src="/images/HPA.svg" alt="HPA Logo"/></a></>} labelPlacement="start"/>
                        <FormControlLabel className={styles.formItem} control={<Switch onChange={() => updateDatabases(5)} defaultChecked />} label={<><a className={styles.logoLink} href="https://gtexportal.org/home/" target="_blank" rel="noopener noreferrer"><img className={styles.p_databaseLogo} src="/images/GTEx.png" alt="GTEx Logo"/></a></>} labelPlacement="start"/>
                    </FormGroup>
                </div>

                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: '10px', gap: '10px', width: '100%'}}>
                    
                    <div>
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="GTEx Transcriptomics" {...a11yProps(0)} />
                                <Tab label="ARCHS4" {...a11yProps(1)} />
                                <Tab label="Tabula Sapiens" {...a11yProps(2)} />
                                <Tab label="HPM" {...a11yProps(3)} />
                                <Tab label="HPA" {...a11yProps(4)} />
                                <Tab label="GTEx Proteomics" {...a11yProps(5)} />
                                </Tabs>
                            </Box>
                            <TabPanel value={value} index={0}>
                                {
                                    gtex_transcriptomics != null 
                                        ? 
                                            <div id="gtex_transcriptomics">
                                                <Plot
                                                    data={[gtex_transcriptomics]}
                                                    layout={{width: '800', height: '1500', title: props.gene + ' (RNA-seq) GTEx', yaxis: {automargin: true}}}
                                                    config={{responsive: true}}
                                                    id={"gtex_transcriptomics"}
                                                />
                                            </div>
                                            
                                        : 
                                            <div>Nothing here...</div>
                                }
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                {
                                    archs4 != null 
                                        ? 
                                            <div id="archs4">
                                                <Plot
                                                    data={[archs4]}
                                                    layout={{width: '800', height: '1500', title: props.gene + ' (RNA-seq) ARCHS4',
                                                    yaxis: {
                                                    automargin: true
                                                    }}}
                                                />
                                            </div>
                                            
                                        : 
                                            <div>Nothing here...</div>
                                }
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                {
                                    tabula_sapiens != null 
                                        ? 
                                            <div id="tabula_sapiens">
                                                <Plot
                                                    data={[tabula_sapiens]}
                                                    layout={{width: '800', height: '1500', title: props.gene + ' (RNA-seq) Tabula Sapiens',
                                                    yaxis: {
                                                    automargin: true
                                                    }}}
                                                />
                                            </div>
                                            
                                        : 
                                            <div>Nothing here...</div>
                                }
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                                {
                                    hpm != null 
                                        ? 
                                            <div id="hpm">
                                                <Plot
                                                    data={[hpm]}
                                                    layout={{width: '800', height: '1500', title: props.gene + ' (HPM)',
                                                    yaxis: {
                                                    automargin: true
                                                    },
                                                    xaxis: {
                                                        title: {
                                                        text: 'Average Spectral Counts',
                                                        }
                                                    }
                                                    }}
                                                />
                                            </div>
                                        : 
                                            <div>Nothing here...</div>
                                }
                            </TabPanel>
                            <TabPanel value={value} index={4}>
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
                                                />
                                            </div>
                                        : 
                                            <div>Nothing here...</div>
                                }
                            </TabPanel>
                            <TabPanel value={value} index={5}>
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
                                                />
                                            </div>
                                        : 
                                            <div>Nothing here...</div>
                                }
                            </TabPanel>
                        </Box>
                    </div>
                </div>
            </div>
            
            <Footer/>

            </div>
        </div>
      
    )
  }

