import styles from '../styles/Main.module.css';
import { useRuntimeConfig } from "./runtimeConfig";
import { FormGroup, FormControlLabel, Switch, Autocomplete, TextField, Container, Tooltip, tooltipClasses, CircularProgress } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';




export default function SideBar(props) {
    const runtimeConfig = useRuntimeConfig()
    var database = props.database
    var setDatabase = props.setdatabase
    var updateURL = props.updateurl
    var geneList = props.geneList
    var input = props.input
    var HtmlTooltip = props.HtmlTooltip
    var setInput = props.setinput
    var submitGene = props.submitgene

    let ARCHS4_link = <a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">ARCHS4</a>;
    let GTEx_transcriptomics_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">GTEx transcriptomics</a>;
    let Tabula_Sapiens_link = <a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">Tabula Sapiens</a>;
    let CCLE_transcriptomics_link = <a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;
    let HPM_link = <a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">Human Proteome Map (HPM)</a>;
    let HPA_link = <a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">Human Protein Atlas (HPA)</a>;
    let GTEx_proteomics_link = <a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">GTEx proteomics</a>;
    let CCLE_proteomics_link = <a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;

    let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>
    let Tabula_Sapiens_links = <><a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_transcriptomics_links = <><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPM_links = <><a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPA_links = <><a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_proteomics_links = <><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_proteomics_links = <><a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">citation</a></>

    let ARCHS4_str_m = ', developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
    let GTEx_transcriptomics_str_m = ' provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';
    let Tabula_Sapiens_str_m = ' is a gene expression atlas created from single cell RNA-seq data collected from multiple tissues of 16 postmortem donors. The processed data contains average expression of each human gene in 486 cell types.';
    let CCLE_transcriptomics_str_m = ' transcriptomics dataset contains gene expression data collected with RNA-seq from over 1000 human pan-cancer cell lines.';
    let HPM_str_m = ' contains data from LC-MS/MS proteomics profiling protein expression in 30 human tissues collected from 17 adult postmortem donors.';
    let HPA_str_m = ' contains protein expression data from 44 normal human tissues derived from antibody-based protein profiling using immunohistochemistry.';
    let GTEx_proteomics_str_m = ' dataset has relative protein levels for more than 12,000 proteins across 32 normal human tissues. The data was collected using tandem mass tag (TMT) proteomics to profile tissues collected from 14 postmortem donors.';
    let CCLE_proteomics_str_m = ' proteomics dataset contains protein expression in 375 pan-cancer cell lines. Data was collected by quantitative multiplex mass spectrometry proteomics.';


    let ARCHS4_desc = <>{ARCHS4_link}{ARCHS4_str_m} <span style={{whiteSpace: 'nowrap'}}>{ARCHS4_links}</span></>;
    let GTEx_transcriptomics_desc = <>{GTEx_transcriptomics_link}{GTEx_transcriptomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{GTEx_transcriptomics_links}</span></>;
    let Tabula_Sapiens_desc = <>{Tabula_Sapiens_link}{Tabula_Sapiens_str_m} <span style={{whiteSpace: 'nowrap'}}>{Tabula_Sapiens_links}</span></>;
    let CCLE_transcriptomics_desc = <>The {CCLE_transcriptomics_link}{CCLE_transcriptomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{CCLE_transcriptomics_links}</span></>;
    let HPM_desc = <>The {HPM_link}{HPM_str_m} <span style={{whiteSpace: 'nowrap'}}>{HPM_links}</span></>;
    let HPA_desc = <>The {HPA_link}{HPA_str_m} <span style={{whiteSpace: 'nowrap'}}>{HPA_links}</span></>;
    let GTEx_proteomics_desc = <>The {GTEx_proteomics_link}{GTEx_proteomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{GTEx_proteomics_links}</span></>;
    let CCLE_proteomics_desc = <>The {CCLE_proteomics_link}{CCLE_proteomics_str_m} <span style={{whiteSpace: 'nowrap'}}>{CCLE_proteomics_links}</span></>;


    return (
    <div className={styles.dbGroup}>
        <div style={{ marginBottom: '15px' }}>
            <Autocomplete
                disablePortal
                disableClearable
                freeSolo={true}
                value={''}
                options={geneList}
                sx={{ width: 400 }}
                inputValue={input}
                onInputChange={(event, value, reason) => {
                    if (reason == 'input') {
                        setInput(value);
                    }
                }}
                onChange={(event, value) => { submitGene(value) }}
                renderInput={(params) => <TextField {...params} label="Human Gene Symbol" />}
            />

        </div>
        <div className={styles.dbMenu}>

            <div>
                <h3 style={{ margin: '0' }}>Transcriptomics</h3>
                <FormGroup style={{ alignItems: 'center' }}>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(0); updateURL(0) }} checked={database == 0} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} alt="archs4 Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://maayanlab.cloud/archs4/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{ARCHS4_desc}</div>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(1); updateURL(1) }} checked={database == 1} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} alt="GTEx Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{GTEx_transcriptomics_desc}</div>



                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(2); updateURL(2) }} checked={database == 2} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{ borderRadius: '8px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} alt="Tabula Sapiens Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://tabula-sapiens-portal.ds.czbiohub.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{Tabula_Sapiens_desc}</div>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(3); updateURL(3) }} checked={database == 3} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{ borderRadius: '3px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} alt="CCLE Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{CCLE_transcriptomics_desc}</div>

                </FormGroup>
            </div>

            <div>
                <h3 style={{ margin: '0' }}>Proteomics</h3>
                <FormGroup style={{ alignItems: 'center' }}>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(4); updateURL(4) }} checked={database == 4} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{ width: '200px', marginRight: '0' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} alt="HPM Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="http://www.humanproteomemap.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{HPM_desc}</div>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(5); updateURL(5) }} checked={database == 5} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{ width: '200px', padding: '10px', marginLeft: '0px', marginRight: '-20px', backgroundColor: '#8eaabe', borderRadius: '5px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} alt="HPA Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://www.proteinatlas.org" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{HPA_desc}</div>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(6); updateURL(6) }} checked={database == 6} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} alt="GTEx Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{GTEx_proteomics_desc}</div>

                    <FormControlLabel
                        className={styles.formItem}
                        control={<Switch onChange={() => { setDatabase(7); updateURL(7) }} checked={database == 7} />}
                        label={
                            <div className={styles.dbLogo}>
                                <img className={styles.databaseLogo} style={{ borderRadius: '3px' }} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} alt="CCLE Logo" />
                                <HtmlTooltip arrow TransitionComponent={Zoom} placement="top" title={
                                    <div className={styles.tooltipText}><a href="https://gygi.hms.harvard.edu" target="_blank" rel="noopener noreferrer">Website</a> <br /> <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">Citation</a></div>}>
                                    <IconButton><InfoIcon color='info' /></IconButton>
                                </HtmlTooltip>
                            </div>
                        }
                        labelPlacement="start" />

                    <div className={styles.logoDesc}>{CCLE_proteomics_desc}</div>
                </FormGroup>
            </div>

        </div>
    </div>)
}