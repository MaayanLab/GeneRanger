import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/Main.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import Button from '@mui/material/Button';

export default function Page() {

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <div style={{height: '1000px'}}>
                    <p>[TODO: make it possible to get back to the main page from here]</p>
                    <div>
                        <b>API Documentation:</b>
                    </div>
                    <br/>
                    <div>
                        Endpoint: https://maayanlab.cloud/generanger/api/data
                    </div>
                    <br/>
                    <div><b>Instructions:</b></div>
                    <br/>
                    <div>
                        Sending an &quot;application/json&quot; POST request to the above endpoint with the body of {'{'}&quot;gene&quot;: &quot;gene_name&quot;{'}'}, where gene_name is a placeholder of your chosen gene, will return all of GeneRanger&apos;s information regarding that particular gene.
                        Note that sending a GET request instead will return all of GeneRanger&apos;s information regarding gene A2M.                    
                    </div>
                    <br/>
                    <div>
                        To get information from specific databases, include another property to the request body called &quot;databases&quot; that consists of the desired database names separated by commas.
                    </div>
                    <br/>
                    <div>
                        The database choices are: ARCHS4, GTEx_transcriptomics, Tabula_Sapiens, CCLE_transcriptomics, HPM, HPA, GTEx_proteomics, and CCLE_proteomics.
                    </div>
                    <br/>
                    <div>
                        <p><b>Examples using curl to request GeneRanger&apos;s information:</b></p>
                        <p>Requesting all information for gene A2M:</p>
                        <code>curl -X POST -H &quot;Content-Type: application/json&quot; -d &apos;{'{'}&quot;gene&quot;: &quot;A2M&quot;{'}'}&apos; https://maayanlab.cloud/generanger/api/data</code>
                        <p>Requesting all information regarding gene A2M from databases ARCHS4, GTEx Transcriptomics, and Tabula Sapiens:</p>
                        <code>curl -X POST -H &quot;Content-Type: application/json&quot; -d &apos;{'{'}&quot;gene&quot;: &quot;A2M&quot;, &quot;databases&quot;: &quot;ARCHS4,GTEx_transcriptomics,Tabula_Sapiens&quot;{'}'}&apos; https://maayanlab.cloud/generanger/api/data</code>
                    </div>
                    <br/>
                    <div>
                        <b>The data format:</b>
                        <p>The data is returned as a JSON object containing a property called &apos;allData&apos;.  Inside, there are three properties called &quot;gene&quot;, &quot;dbData&quot;, and &quot;NCBI_data&quot;. The &quot;gene&quot; property refers to the gene 
                            that was queried. &quot;NCBI_data&quot; contains the NCBI description for the chosen gene.  &quot;dbData&quot; contains a property for each database requested, containing the information regarding the chosen gene from
                            that particular database.
                        </p>
                        <p>[TODO: Put a visualization of the structure here and describe the dbData property more]</p>
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <div>
                        <b>Download the databases:</b>
                    </div>
                    <p>Transcriptomics:</p>
                    <Button variant="contained" color="primary">ARCHS4</Button>
                    <Button variant="contained" color="primary">GTEx Transcriptomics</Button>
                    <Button variant="contained" color="primary">Tabula Sapiens</Button>
                    <Button variant="contained" color="primary">Cancer Cell Line Encyclopedia (Transcriptomics)</Button>
                    <p>Proteomics:</p>
                    <Button variant="contained" color="primary">Human Proteome Map</Button>
                    <Button variant="contained" color="primary">Human Protein Atlas</Button>
                    <Button variant="contained" color="primary">GTEx Proteomics</Button>
                    <Button variant="contained" color="primary">Cancer Cell Line Encyclopedia (Proteomics)</Button>
                    <p>[TODO: Make these buttons actually work (and look good)]</p>
                    
                </div>
            
                <Footer/>

            </div>
        </div>
      
    )
  }

