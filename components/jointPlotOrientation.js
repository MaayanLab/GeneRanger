import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

export default function JointPlotOrientation({ data, title, text, kind }) {
    const alllabels = {}
    Object.values(data).forEach(({ names }) => {names.forEach(l => {alllabels[l] = null})})
    const alignedData = {}
    Object.keys(data).forEach((db, i) => {
        alignedData[db] = {}
        Object.keys(data[db]).forEach(desc => {
            alignedData[db] = {}
            Object.values(data[db].mean).forEach((v, j) => {
                alignedData[db][data[db].names[j]] = v
            })
        })
    })
    if (kind === 'scatterplot') {
        const [x, y] = Object.keys(alignedData)
        const alldata = [{
            x: Object.keys(alllabels).map(label => alignedData[x][label]),
            y: Object.keys(alllabels).map(label => alignedData[y][label]),
            text: Object.keys(alllabels),
            mode: 'text',
            textposition: 'top center',
        }]
        return <>
            <div style={{ height: '800px', overflowX: 'scroll'}}>
                <Plot
                    data={alldata}
                    layout={{
                        title: {text: title, xanchor: 'left', yanchor: 'top', x: 0}, 
                        xaxis: {
                            title: {
                                text: x,
                            },
                            automargin: true,
                        },
                        yaxis: {
                            title: {
                                text: y
                            },
                            automargin: true,
                        },
                        font: {
                            size: 16,
                        },
                    }}
                    style={{ width: '100%', height: '100%' }}
                    config={{ responsive: true }}
                />
            </div>
        </>
    }
    const alllabels_sorted = Object.keys(alllabels)
    alllabels_sorted.sort((a, b) =>
        Object.values(alignedData).reduce((agg, datum) =>
            datum[b] !== undefined ? agg + datum[b] : agg, 0)
        - Object.values(alignedData).reduce((agg, datum) =>
            datum[a] !== undefined ? agg + datum[a] : agg, 0)
    )
    const labels_length = Object.keys(alllabels).length
    const labels_length_px = (labels_length * 25).toString() + 'px'
    const alldata = []
    Object.keys(data).forEach((bg, i) => {
        const val_names = ['lowerfence', 'upperfence', 'mean', 'median', 'q1', 'q3', 'sd']
        const d = {}
        d['name'] = bg
        if  ('q1' in data[bg]) {
            d['type'] = 'box'
        } else {
            d['type'] = 'scatter'
            d['marker'] = {color: '#1f77b4'}
            d["mode"]= 'markers'
        }
        
        val_names.forEach((attr) => {
            if (attr in data[bg]) {
                d[attr] = data[bg][attr];
            }
        });
        if (kind === 'horizontal') {
            d.x = data[bg].names
            d.orientation = 'v'
         } else if (kind === 'vertical') {
            d.y = data[bg].names
            d.orientation = 'h'
         }

        alldata.push(d)
    })

    if (kind === 'horizontal') {
        return <>
            <div style={{ height: '800px', overflowX: 'scroll'}}>
                <Plot
                    data={alldata}
                    layout={{
                        title: {text: title, xanchor: 'left', yanchor: 'top', x: 0}, 
                        boxmode: 'group',
                        xaxis: {
                            automargin: true,
                            range: [-0.5, labels_length],
                            tickangle: 45,
                            categoryorder: 'array',
                            categoryarray: alllabels_sorted,
                        },
                        yaxis: {
                            title: {
                                text: text
                            },
                            automargin: true,
                        },

                    }}
                    style={{ width: labels_length_px, height: '100%' }}
                    config={{ responsive: true }}
                />
            </div>
        </>
    } else if (kind === 'vertical') {
        return <> 
            <div style={{ height: labels_length_px }}>
                <Plot
                    data={alldata}
                    layout={{
                        title: title,
                        boxmode: 'group',
                        yaxis: {
                            automargin: true,
                            range: [-0.5, labels_length],
                            categoryorder:'array',
                            categoryarray: alllabels_sorted.reverse(),
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
            </div>
        </>
    }
}
