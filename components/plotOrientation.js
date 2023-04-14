import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

export default function PlotOrientation({ data, labels_x, labels_y, title, text, horizontal }) {

    console.log({
        ...data,
        ...labels_y
    })
    const height = (labels_x['x'].length * 25).toString() + 'px'
    return (<>
    {horizontal ? 
    <>
        <div style={{ height: '1000px'}}>
        <Plot
            data={[{
                ...data,
                ...labels_x
            }]}
            layout={{
                title: title, 
                xaxis: { automargin: true },
                yaxis: {
                    title: {
                        text: text
                    },
                    automargin: true,
                },

            }}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true }}
        />
    </div>
    </>: <> 
    <div style={{ height: height }}>
        <Plot
            data={[{...data, ...labels_y}]}
            layout={{
                title: title,
                yaxis: {
                    automargin: true,
                    range: [-0.5, labels_y['y'].length]
                },
                xaxis: {
                    title: {
                        text: text
                    }
                }
            }}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true }}
        />
    </div></>}
    </>
    )
}
