import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '@mui/material';
import styles from '../../styles/Dashboard.module.css';
import { Responsive, WidthProvider } from "react-grid-layout";
import { PrismaClient } from '@prisma/client';
import React from 'react';
import dynamic from 'next/dynamic';
import { ConstructionOutlined } from '@mui/icons-material';
// import Plot from 'react-plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});

const ResponsiveGridLayout = WidthProvider(Responsive);

const layout = [
    { i: "a", x: 0, y: 0, w: 2, h: 2 },
    { i: "b", x: 2, y: 0, w: 2, h: 2 },
    { i: "c", x: 4, y: 0, w: 2, h: 2 },
    { i: "d", x: 6, y: 0, w: 2, h: 2 },
    { i: "e", x: 8, y: 0, w: 2, h: 2 },
    { i: "f", x: 10, y: 0, w: 2, h: 2 }
  ];

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

    console.log(props.all_db_data);

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


    return (
        <div className={styles.mainDiv}>

            <Head>
                <title>Single Gene and Protein Expression Dashboard</title>
                <link rel="icon" href="/images/logo.png" />
            </Head>

            <div className={styles.title}>
                <img className={styles.mainLogo} src="/images/logo.png" alt="App Logo" width={150} height={"auto"} />
                <h1 className={styles.header}>Gene and Protein Expression across Human Cells and Tissues</h1>
            </div>

            <h1>
                Selected Gene: {props.gene}
            </h1>

            {/* <div className={styles.dbDiv}>

                <div className={styles.dbGroup}>
                    <h2>Transcriptomics</h2>
                    <div>GTEx {props.databases[0] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                    <div>ARCHS4 {props.databases[1] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                    <div>Tabula Sapiens {props.databases[2] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                </div>

                <div className={styles.dbGroup}>
                    <h2>Proteomics</h2>
                    <div>HPM {props.databases[3] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                    <div>HPA {props.databases[4] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                    <div>GTEx {props.databases[5] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                </div>

            </div> */}

            <Link 
                href={{
                    pathname: "../"
                    }}>
                <Button variant="contained">Home</Button>
            </Link>

            {
                gtex_transcriptomics != null 
                    ? 
                        <Plot
                            data={[gtex_transcriptomics]}
                            layout={{width: '1000', height: '1000', title: props.gene + ' (RNA-seq) GTEx', yaxis: {automargin: true}}}
                            config={{responsive: true}}
                        />
                    : 
                        <div>Nothing here...</div>
            }

            {
                archs4 != null 
                    ? 
                        <Plot
                            data={[archs4]}
                            layout={{width: '1000', height: '1000', title: props.gene + ' (RNA-seq) ARCHS4',
                            yaxis: {
                              automargin: true
                            }}}
                        />
                    : 
                        <div>Nothing here...</div>
            }

            {
                tabula_sapiens != null 
                    ? 
                        <Plot
                            data={[tabula_sapiens]}
                            layout={{width: '1000', height: '10000', title: props.gene + ' (RNA-seq) Tabula Sapiens',
                            yaxis: {
                              automargin: true
                            }}}
                        />
                    : 
                        <div>Nothing here...</div>
            }

            {
                hpm != null 
                    ? 
                        <Plot
                            data={[hpm]}
                            layout={{width: '1000', height: '1000', title: props.gene + ' (HPM)',
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
                    : 
                        <div>Nothing here...</div>
            }

            {
                hpa != null 
                    ? 
                        <Plot
                            data={[hpa]}
                            layout={{width: '1000', height: '1000', title: props.gene + ' (HPA)',
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
                    : 
                        <div>Nothing here...</div>
            }

            {
                gtex_proteomics != null 
                    ? 
                        <Plot
                            data={gtex_proteomics}
                            layout={{width: '1000', height: '1000', title: props.gene + ' (GTEx Proteomics)',
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
                    : 
                        <div>Nothing here...</div>
            }

            {/* <ResponsiveGridLayout
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 1100, sm: 1000, xs: 900, xxs: 800 }}
                cols={{ lg: 14, md: 12, sm: 10, xs: 8, xxs: 6 }}
                rowHeight={300}
                className={styles.grid}
            >
                <div key="a" style={{backgroundColor: "darkgray"}}>

                </div>

                <div key="b" style={{backgroundColor: "darkgray"}}>

                </div>

                <div key="c" style={{backgroundColor: "darkgray"}}>

                </div>

                <div key="d" style={{backgroundColor: "darkgray"}}>

                </div>

                <div key="e" style={{backgroundColor: "darkgray"}}>

                </div>

                <div key="f" style={{backgroundColor: "darkgray"}}>

                </div>
        
        </ResponsiveGridLayout> */}

        <footer className={styles.footer}>
            <div className={styles.footerLinks}>
                <div><a className={styles.link} href="mailto:avi.maayan@mssm.edu">Contact Us</a></div>
                <div><a className={styles.link} href="https://github.com/MaayanLab/single-gene-expression-dashboard/blob/main/LICENSE">Usage License</a></div>
            </div>
            <div>
                <a href="https://icahn.mssm.edu/research/bioinformatics" target="_blank" rel="noopener noreferrer"><Image src="/images/icahn_cb.png" alt="School Logo" width={137} height={80} /></a>
            </div>
            <div>
                <a href="https://labs.icahn.mssm.edu/maayanlab/" target="_blank" rel="noopener noreferrer"><Image style={{borderRadius: '10px'}} src="/images/maayanlab_logo.png" alt="Lab Logo" width={80} height={80} /></a>
            </div>
            <div className={styles.githubButtons}>
                <a className={styles.buttonLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><Image style={{borderRadius: '5px'}} src="/images/GitHub-Mark.png" alt="GitHub Logo" width={16} height={16} />&nbsp;View source code</Button></a>
                <a className={styles.buttonLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard/issues/new" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><Image style={{borderRadius: '5px'}} src="/images/GitHub-Mark.png" alt="GitHub Logo" width={16} height={16} />&nbsp;Submit an issue</Button></a>
            </div>
        </footer>

        </div>
      
    )
  }

