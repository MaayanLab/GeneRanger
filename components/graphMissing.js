import * as React from 'react';
import ErrorIcon from '@mui/icons-material/Error';

export default class GraphMissing extends React.Component {

    render() {
        return (

            <div style={{width: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', gap: '30px'}}>
                <ErrorIcon sx={{ fontSize: 50 }}/>
                <div>The gene you searched for was not found in this database.</div>
            </div>
               
        );
    }

}