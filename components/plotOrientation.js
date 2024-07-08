import dynamic from 'next/dynamic';
import categories from '../public/files/categories.json';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

// Function to calculate the mean of an array
function calculateMean(array) {
    return array.reduce((acc, val) => acc + val, 0) / array.length;
}

export default function PlotOrientation({ data, labels_x, labels_y, title, text, horizontal }) {

    const labels_length = (labels_x['x'].length * 25).toString() + 'px';
    const val_names = ['lowerfence', 'upperfence', 'mean', 'median', 'q1', 'q3', 'sd'];
    var data_reverse = {};

    if ('q1' in data) {
        data_reverse['type'] = 'box';
    } else {
        data_reverse['type'] = 'scatter';
        data_reverse['marker'] = { color: '#1f77b4' };
        data_reverse['mode'] = 'markers';
    }

    val_names.forEach((attr) => {
        if (attr in data) {
            data_reverse[attr] = data[attr].slice().reverse().map((x) => x === null ? 0 : x);
        }
    });

    val_names.forEach((attr) => {
        if (attr in data) {
            data[attr] = data[attr].map((x) => x === null ? 0 : x);
        }
    });



    if (data_reverse['type'] == 'box') {
    const labels_y_categories = labels_y['y'].map((x) => categories[x]);
    const labels_x_categories = labels_x['x'].map((x) => categories[x]);

    var traces = [];
    const defaultPlotlyColors = [
        '#1f77b4', // muted blue
        '#ff7f0e', // safety orange
        '#2ca02c', // cooked asparagus green
        '#d62728', // brick red
        '#9467bd', // muted purple
        '#8c564b', // chestnut brown
        '#e377c2', // raspberry yogurt pink
        '#7f7f7f', // middle gray
        '#bcbd22', // curry yellow-green
        '#17becf'  // blue-teal
    ];
    var color_index = 0;
    const color_map = {};
    labels_x_categories.filter(onlyUnique).forEach((category) => {
        if (category === undefined) return;
        const index = getAllIndexes(labels_x_categories, category);
        const trace = {
            name: category,
            lowerfence: data_reverse['lowerfence']?.filter((x, i) => index.includes(i)),
            upperfence: data_reverse['upperfence']?.filter((x, i) => index.includes(i)),
            mean: data_reverse['mean']?.filter((x, i) => index.includes(i)),
            median: data_reverse['median']?.filter((x, i) => index.includes(i)),
            q1: data_reverse['q1']?.filter((x, i) => index.includes(i)),
            q3: data_reverse['q3']?.filter((x, i) => index.includes(i)),
            orientation: 'v',
            width: '1000px',
            x: labels_x['x'].filter((x, i) => index.includes(i)),
            type: data_reverse['type'],
            visible: true,
            marker: {
                color: defaultPlotlyColors[color_index],
            },
        };
        traces.push(trace);
        color_map[category] = defaultPlotlyColors[color_index];
        color_index++;
    });

    var traces_y = [];
    

    labels_y_categories.filter(onlyUnique).forEach((category) => {
        if (category === undefined) return;
        const index = getAllIndexes(labels_y_categories, category);
        const trace = {
            name: category,
            lowerfence: data['lowerfence']?.filter((x, i) => index.includes(i)),
            upperfence: data['upperfence']?.filter((x, i) => index.includes(i)),
            mean: data['mean']?.filter((x, i) => index.includes(i)),
            median: data['median']?.filter((x, i) => index.includes(i)),
            q1: data['q1']?.filter((x, i) => index.includes(i)),
            q3: data['q3']?.filter((x, i) => index.includes(i)),
            orientation: 'h',
            y: labels_y['y'].filter((x, i) => index.includes(i)),
            type: data['type'],
            visible: true,
            marker: {
                color: color_map[category],
            }
        };
        traces_y.push(trace);
    

    });

    console.log(traces);
    console.log(traces_y);

    

    // Adjusted sorting logic for traces
    traces = traces.sort((a, b) => calculateMean(a.mean) + calculateMean(b.mean));
    traces_y = traces_y.sort((a, b) => calculateMean(a.mean) - calculateMean(b.mean));

    return (
        <>
            {horizontal ? (
                <div style={{ height: '1000px', overflowX: 'scroll' }}>
                    <Plot
                        data={traces}
                        layout={{
                            title: { text: title, xanchor: 'left', yanchor: 'top', x: 0 },
                            xaxis: {
                                automargin: true,
                                //range: [-0.5, labels_x['x'].length],
                                autotick: false,
                                tickangle: -45,
                            },
                            yaxis: {
                                title: {
                                    text: text,
                                },
                                automargin: true,
                            },
                            //boxmode: 'overlay',
                            legend: {
                                x: 0.01, // Position the legend over the plot (adjust as needed)
                                y: 0.99, // Position the legend at the top (adjust as needed)
                                xanchor: 'left',
                                yanchor: 'top',
                                orientation: 'v', // Set orientation to vertical
                                bgcolor: 'rgba(255, 255, 255, 0.8)', // Optional: add background color with transparency
                            },
                            margin: {
                                l: 0, // Increase the left margin for better readability
                                r: 0, // Increase right margin for the legend
                                b: 50,
                                t: 50,
                            },
                        }}
                        style={{ width: labels_length, height: '100%' }}
                        config={{ responsive: true }}
                        
                    />
                </div>
            ) : (
                <div style={{ height: labels_length }}>
                    <Plot
                        data={traces_y}
                        layout={{
                            title: title,
                            yaxis: {
                                automargin: true,
                            },
                            xaxis: {
                                title: {
                                    text: text,
                                },
                            },
                            margin: {
                                l: 0, // Increase the left margin for better readability
                                r: 100, // Increase right margin for the legend
                                b: 50,
                                t: 50,
                            },
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: true }}
                    />
                </div>
            )}
        </>
    );

    } else {

        traces = [{
            ...data_reverse,
            ...labels_x
        }]

        traces_y = [{
            ...data,
            ...labels_y
        }]

        return (
            <>
                {horizontal ? (
                    <div style={{ height: '1000px', overflowX: 'scroll' }}>
                        <Plot
                            data={traces}
                            layout={{
                                title: { text: title, xanchor: 'left', yanchor: 'top', x: 0 },
                                xaxis: {
                                    automargin: true,
                                    range: [-0.5, labels_x['x'].length],
                                    autotick: false,
                                    tickangle: -45,
                                },
                                yaxis: {
                                    title: {
                                        text: text,
                                    },
                                    automargin: true,
                                },
                                //boxmode: 'overlay',
                                legend: {
                                    x: 0.01, // Position the legend over the plot (adjust as needed)
                                    y: 0.99, // Position the legend at the top (adjust as needed)
                                    xanchor: 'left',
                                    yanchor: 'top',
                                    orientation: 'v', // Set orientation to vertical
                                    bgcolor: 'rgba(255, 255, 255, 0.8)', // Optional: add background color with transparency
                                },
                                margin: {
                                    l: 0, // Increase the left margin for better readability
                                    r: 0, // Increase right margin for the legend
                                    b: 50,
                                    t: 50,
                                },
                            }}
                            style={{ width: labels_length, height: '100%' }}
                            config={{ responsive: true }}
                            
                        />
                    </div>
                ) : (
                    <div style={{ height: labels_length }}>
                        <Plot
                            data={traces_y}
                            layout={{
                                title: title,
                                yaxis: {
                                    automargin: true,
                                    range: [-0.5, labels_x['x'].length],
                                },
                                xaxis: {
                                    title: {
                                        text: text,
                                    },
                                },
                                margin: {
                                    l: 0, // Increase the left margin for better readability
                                    r: 100, // Increase right margin for the legend
                                    b: 50,
                                    t: 50,
                                },
                            }}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true }}
                        />
                    </div>
                )}
            </>
        );
    }
}


    
