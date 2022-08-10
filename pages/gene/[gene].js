
import styles from '../../styles/Dashboard.module.css'
import { useRouter } from "next/router";
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

export default function Dashboard() {
    const router = useRouter();
    const query = router.query;
    const gene = query.gene;
    const databases = query.databases;

    return (
    <div>
        <div>
            This is the dashboard page for the {gene} gene.
        </div>
        <div>
            Other information is {databases}.
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

