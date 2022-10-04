import * as React from 'react';

function GeneDescription({NCBI_data, gene}) {

    // Gene links

    let NCBI_entrez = 'https://www.ncbi.nlm.nih.gov/gene/?term=' + gene;
    let GeneCards = 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + gene;
    let Harmonizome = 'https://maayanlab.cloud/Harmonizome/gene/' + gene;
    let ARCHS4_link = 'https://maayanlab.cloud/archs4/gene/' + gene;
    let GDLPA = 'https://cfde-gene-pages.cloud/gene/' + gene +'?CF=false&PS=true&Ag=true&gene=false&variant=false';

    return (
        <>
            {
                NCBI_data == 'No gene description available.'
                    ?
                        <div style={{textAlign: 'center'}}>{NCBI_data}</div>
                    :
                        <>
                            <div><b>Short description (from NCBI&apos;s Gene Database):</b> {NCBI_data}</div>
                            <br/>
                            <div><b>Gene pages on other sites:</b></div>
                            <br/>
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '25px'}}>
                                <a style={{textDecoration: 'none'}} href={ARCHS4_link} target="_blank" rel="noopener noreferrer">ARCHS4</a>
                                <a style={{textDecoration: 'none'}} href={Harmonizome} target="_blank" rel="noopener noreferrer">Harmonizome</a>
                                <a style={{textDecoration: 'none'}} href={NCBI_entrez} target="_blank" rel="noopener noreferrer">Entrez Gene</a>
                                <a style={{textDecoration: 'none'}} href={GeneCards} target="_blank" rel="noopener noreferrer">GeneCards</a>
                                <a style={{textDecoration: 'none'}} href={GDLPA} target="_blank" rel="noopener noreferrer">GDLPA</a>
                            </div>
                            <br/>
                        </>
                        
            }
        </> 
    );
}

export default GeneDescription;

