import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

export default function PlotOrientation({ data, labels_x, labels_y, title, text, horizontal }) {

    const labels_length = (labels_x['x'].length * 25).toString() + 'px'
    const val_names = ['lowerfence', 'upperfence', 'mean', 'median', 'q1', 'q3', 'sd']
    var data_reverse = {}
    if  ('q1' in data) {
        data_reverse['type'] = 'box'
    } else {
        data_reverse['type'] = 'scatter'
        data_reverse['marker'] = {color: '#1f77b4'}
        data_reverse["mode"]= 'markers'
    }
    
    val_names.forEach((attr) => {
        if (attr in data) {
            data_reverse[attr] = data[attr].slice().reverse();
        }
    });
    return (<>
    {horizontal ? 
    <>
        <div style={{ height: '800px', overflowX: 'scroll'}}>
        <Plot
            data={[{
                ...data_reverse,
                ...labels_x
            }]}
            layout={{
                title: {text: title, xanchor: 'left', yanchor: 'top', x: 0.05}, 
                xaxis: { automargin: true,
                        range: [-0.5, labels_x['x'].length],
                        tickangle: 45 },
                yaxis: {
                    title: {
                        text: text
                    },
                    automargin: true,
                },

            }}
            style={{ width: labels_length, height: '100%' }}
            config={{ responsive: true }}
        />
    </div>
    </>: <> 
    <div style={{ height: labels_length }}>
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
