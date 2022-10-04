import * as React from 'react';
import ErrorIcon from '@mui/icons-material/Error';

export default class GraphMissing extends React.Component {

    render() {
        return (

            <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '25px', marginBottom: '25px', gap: '30px'}}>
                <ErrorIcon sx={{ fontSize: 50 }}/>
                <div>The gene you searched for was not found in this database.</div>
            </div>
               
        );
    }

}