import * as React from "react";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import membrane_protiens from '../public/files/membrane_protiens.json';
import styles from '../styles/TargetScreener.module.css';
import { useState } from "react";
import { Button, Image, Tooltip } from "@mui/material";



export default function TargetResultTable(props) {
    var results = JSON.parse(props.results);
    const membraneGenes = JSON.parse(props.membraneGenes);
    const filt = props.filt;
    const setFilt = props.setFilt;
    const setGene = props.setgene;

    const columns = [
        { field: "gene", headerName: "Gene", minWidth: 100, flex: 1},
        { field: "t", headerName: "t statistic", type: "number", flex: 1, minWidth: 150 },
        { field: "p", headerName: "P-value", type: "number", flex: 1, minWidth: 200 },
        { field: "log2fc", headerName: "log2 Fold Change", type: "number", flex: 1, minWidth: 160},
        { field: "membrane", headerName: "Membrane Protien", type: "number", flex: 1, minWidth: 150},
        {
            field: "action",
            headerName: "Links",
            sortable: false,
            flex: 1,
            minWidth: 265,
            renderCell: (params) => {
              const onClickARCHS4 = (e) => {
                e.stopPropagation(); // don't select this row after clicking
        
                window.open(`https://maayanlab.cloud/Harmonizome/gene/${params.id}`, '_blank', 'noreferrer');
              };
              const onClickHARMONIZOME = (e) => {
                e.stopPropagation();
        
                window.open(`https://maayanlab.cloud/Harmonizome/gene/${params.id}`);
              };
              const onClickGDLPA = (e) => {
                e.stopPropagation();
        
                window.open(`https://cfde-gene-pages.cloud/gene/${params.id}?CF=false&PS=true&Ag=true&gene=false&variant=false`, '_blank', 'noreferrer');
              };

              const onClickPrismEXP = (e) => {
                e.stopPropagation();
        
                window.open(`https://maayanlab.cloud/prismexp/g/${params.id}`, '_blank', 'noreferrer');
              };
        
              return (
                <div className={styles.horizontalFlexbox} style={{gap: '0px', padding: '0px'}}>
                    <Tooltip title="Open in ARCHS4">
                        <Button onClick={onClickARCHS4}><img style={{width: '40px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="archs4 Logo"/></Button>
                    </Tooltip>
                    <Tooltip title="Open in Harmonizome">
                        <Button onClick={onClickHARMONIZOME}><img style={{width: '23px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px', marginLeft: '0px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/harmonizomelogo.png"} alt="archs4 Logo"/></Button>
                    </Tooltip>
                    <Tooltip title="Open in PrismEXP">
                        <Button onClick={onClickPrismEXP}><img sx={{m: 1}} style={{width: '23px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px', marginLeft: '0px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/PrismEXP.png"} alt="archs4 Logo"/></Button>
                    </Tooltip>
                    <Tooltip title="Open in GDLPA">
                        <Button onClick={onClickGDLPA}><img sx={{m: 1}} style={{width: '23px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px', marginLeft: '0px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GDLPA.png"} alt="archs4 Logo"/></Button>
                    </Tooltip>
                </div>
              )
            }
          },
    ]


    function CustomToolbar() {
      return (
        <GridToolbarContainer>
          <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
        </GridToolbarContainer>
      );
    }

    for (let i =0; i < results.length; i++) {
        results[i]['id'] = results[i]['gene']
        results[i]['membrane'] = membrane_protiens.includes(results[i]['gene'])
        results[i]['t'] = Number(results[i]['t']).toFixed(2)
        var pval = results[i]['p']
        if (pval < .001) {
            results[i]['p'] = Number.parseFloat(pval).toExponential(4)
        } else {
            results[i]['p'] = Number.parseFloat(pval).toFixed(4)
        }
        results[i]['log2fc'] = Number.parseFloat(results[i]['log2fc']).toFixed(2)
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
                components={{
                  Toolbar: CustomToolbar,
                }}
            />
    </div>
    )
}
