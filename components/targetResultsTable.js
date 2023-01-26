import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import membrane_protiens from '../public/files/membrane_protiens.json';
import { useState } from "react";


export default function TargetResultTable(props) {
    var results = JSON.parse(props.results);
    const membraneGenes = JSON.parse(props.membraneGenes);
    const filt = props.filt;
    const setFilt = props.setFilt;
    const setGene = props.setgene;

    const columns = [
        { field: "gene", headerName: "Gene", minWidth: 100, flex: 1},
        { field: "t", headerName: "t statistic", type: "number", flex: 1, minWidth: 150 },
        { field: "p", headerName: "P-value", type: "string", width: 200 },
        { field: "log2fc", headerName: "log2 Fold Change", type: "number", minWidth: 160},
        { field: "membrane", headerName: "Membrane Protien", type: "number", minWidth: 150},
      ];

    //results = results.map(row => row['membrane'] = membrane_protiens.includes(row['gene']))
    for (let i =0; i < results.length; i++) {
        results[i]['id'] = results[i]['gene']
        results[i]['membrane'] = membrane_protiens.includes(results[i]['gene'])
    }

    return (
        <div style={{ height: "500px", width: "80%" }}>
            <DataGrid
                rows={results}
                columns={columns}
                filterModel={filt}
                onFilterModelChange={(newFilterModel) =>
                 setFilt(newFilterModel)
                }
                onSelectionModelChange={(newSelection) => {
                    setGene(newSelection[0])
                }}
            />
    </div>
    )
}
