import Head from 'next/head'
import Image from 'next/image'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from '../styles/Home.module.css'
import { Responsive, WidthProvider } from "react-grid-layout";


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

export default function Home() {
  return (
    <div>
      <Head>
        <title>Single Gene Expression Dashboard</title>
        {/* <link rel="icon" type="image/x-icon" href="/favicon.ico" /> */}
      </Head>

      <div style={{display: 'flex', justifyContent: 'center'}}>
      <Image src="/images/logo.png" alt="Logo" width={72} height={16} />
        <h1 className={styles.header}>Gene and Protein Expression across Human Cells and Tissues</h1>
      </div>
      
      <div className={styles.text}>This web app takes the input of a human gene and displays its expression across human cells and tissues utilizing a variety of processed datasets from healthy tissues. If the gene is not contained in one of the datasets, a plot will not be produced for that resource.</div>

      <ResponsiveGridLayout
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 1100, sm: 1000, xs: 900, xxs: 800 }}
        cols={{ lg: 14, md: 12, sm: 10, xs: 8, xxs: 6 }}
        rowHeight={300}
        style={{marginLeft: "auto", marginRight: "auto", backgroundColor: "gray", borderStyle: 'solid', borderRadius: '15px', width: '80%'}}
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
