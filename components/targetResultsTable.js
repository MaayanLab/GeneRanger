import * as React from 'react';
import styles from '../styles/Main.module.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';





export default function TargetResultTable(props) {
    var results = JSON.parse(props.results);

    const columns = Object.keys(results)

    const index = columns.map(col => Object.keys(results[col]))[0]

    var data = columns.map((col)=> {
        return Object.values(results[col])
    })

    const headers = columns.map((c) => c.replace("'", "").replace("(","").replace(")","")).slice(0, 10)

    var rows = [];

    for (let i = 0; i < index.length; i++) {
        var row = [];
        row.push(index[i])
        for (let j=0; j < headers.length; j++) {
            if (data[j][i] == true) {
                row.push('true')
            } else if (data[j][i] == false) {
                row.push('false')
            } else row.push(data[j][i])
        }
        rows.push(row)
    }

    return (
        <Box sx={{ overflow: "auto" }}>
            <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}></Box>
                <Table sx={{ width: '80%'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Gene</TableCell>
                            {
                            headers.map((h) => {
                                return <TableCell>{h}</TableCell>
                            })
                            }
                        </TableRow>
                    </TableHead>
                <TableBody>
                {
                    rows.map((row) => {
                        return (
                        <TableRow>
                            {row.map((val) => {
                                return (
                                    <TableCell>
                                        {val}
                                    </TableCell>
                                )
                            })}
                        </TableRow> 
                        )
                    })
                }
                </TableBody>
            </Table>

        </Box>
    )
}
