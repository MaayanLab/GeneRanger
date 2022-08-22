import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '@mui/material';
import styles from '../../styles/Dashboard.module.css';
import { Responsive, WidthProvider } from "react-grid-layout";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { PrismaClient } from '@prisma/client';

const ResponsiveGridLayout = WidthProvider(Responsive);

const layout = [
    { i: "a", x: 0, y: 0, w: 2, h: 2 },
    { i: "b", x: 2, y: 0, w: 2, h: 2 },
    { i: "c", x: 4, y: 0, w: 2, h: 2 },
    { i: "d", x: 6, y: 0, w: 2, h: 2 },
    { i: "e", x: 8, y: 0, w: 2, h: 2 },
    { i: "f", x: 10, y: 0, w: 2, h: 2 },
    { i: "g", x: 12, y: 0, w: 2, h: 2 }
  ];

export async function getServerSideProps(context) {

    // const prisma = new PrismaClient();

    // let all_db_data = {};

    // if (context.query.databases[0] == "true") {
    //     const gtex_transcriptomics = await prisma.gtex_transcriptomics.findFirst({
    //         where: {
    //             name: context.query.gene,
    //         },
    //     });
    //     Object.assign(all_db_data, {gtex_transcriptomics: gtex_transcriptomics});
    // }
    
    // if (context.query.databases[1] == "true") {
    //     const archs4 = await prisma.archs4.findFirst({
    //         where: {
    //             name: context.query.gene,
    //         },
    //     });
    //     Object.assign(all_db_data, {archs4: archs4});
    // }

    // if (context.query.databases[2] == "true") {
    //     const tabula_sapiens = await prisma.tabula_sapiens.findFirst({
    //         where: {
    //             name: context.query.gene,
    //         },
    //     });
    //     Object.assign(all_db_data, {tabula_sapiens: tabula_sapiens});
    // }

    // if (context.query.databases[3] == "true") {
    //     const hpm = await prisma.hpm.findFirst({
    //         where: {
    //             gene: context.query.gene,
    //         },
    //     });
    //     Object.assign(all_db_data, {hpm: hpm});
    // }

    // if (context.query.databases[4] == "true") {
    //     const hpa = await prisma.hpa.findFirst({
    //         where: {
    //             gene_name: context.query.gene,
    //         },
    //     });
    //     Object.assign(all_db_data, {hpa: hpa});
    // }

    // if (context.query.databases[5] == "true") {
    //     const gtex_proteomics = await prisma.gtex_proteomics.findFirst({
    //         where: {
    //             gene_id: context.query.gene,
    //         },
    //     });
    //     Object.assign(all_db_data, {gtex_proteomics: gtex_proteomics});
    // }

    // console.log(all_db_data)
    
    return { 
        props: {
            gene: context.query.gene,
            databases: context.query.databases, 
            // all_db_data: all_db_data
        } 
    }

}

export default function Dashboard(props) {

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
            

            <ResponsiveGridLayout
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 1100, sm: 1000, xs: 900, xxs: 800 }}
                cols={{ lg: 14, md: 12, sm: 10, xs: 8, xxs: 6 }}
                rowHeight={300}
                className={styles.grid}
            >
                <div key="a" style={{backgroundColor: "darkgray"}}></div>
                <div key="b" style={{backgroundColor: "darkgray"}}></div>
                <div key="c" style={{backgroundColor: "darkgray"}}></div>
                <div key="d" style={{backgroundColor: "darkgray"}}></div>
                <div key="e" style={{backgroundColor: "darkgray"}}></div>
                <div key="f" style={{backgroundColor: "darkgray"}}></div>
                <div key="g" style={{backgroundColor: "darkgray"}}></div>
        
        </ResponsiveGridLayout>

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

