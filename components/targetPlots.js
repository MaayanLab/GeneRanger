import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import PlotResults from './plotResults';


export default function TargetPlots(props) {
    const targets = JSON.parse(props.results);
    const target = props.target;


    return (
      <div className='content'>
        <h3>{target}</h3>
        {
            targets.map(p => {
                return (
                <div>
                <PlotResults results={p}></PlotResults>
                </div>
                )
            })
        }
        
      </div>
    );
};