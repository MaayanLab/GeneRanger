import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';


export default function PlotResults(props) {
    var plot = JSON.parse(props.results);
    return (
      <div className='content'>
        <Plot data={plot.data} layout={plot.layout}/>
      </div>
    );
};