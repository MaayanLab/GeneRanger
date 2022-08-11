import Link from 'next/link'
import { Button } from '@mui/material';
import styles from '../../styles/Dashboard.module.css'
import { Responsive, WidthProvider } from "react-grid-layout";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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

    return { 
        props: {
            gene: context.query.gene,
            databases: context.query.databases 
        } 
    }

}

export default function Dashboard(props) {

    return (
        <div className={styles.mainDiv}>

            <Link 
                href={{
                    pathname: "../"
                    }}>
                <Button variant="contained">Home</Button>
            </Link>

            <div>
                Selected Gene: {props.gene}
            </div>
            <div className={styles.databases}>
                <div>GTEX - gene {props.databases[0] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>} </div>
                <div>ARCHS4 - Tissue {props.databases[1] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                <div>ARCHS4 - Tissue &amp; Cell Type {props.databases[2] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                <div>Tabula Sapiens {props.databases[3] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                <div>HPM {props.databases[4] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                <div>HPA {props.databases[5] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
                <div>GTEx - Proteomics {props.databases[6] === "true" ? <CheckBoxIcon/> : <DisabledByDefaultIcon/>}</div>
            </div>

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
        </div>
      
    )
  }

