import * as React from 'react';
import styles from '../styles/Footer.module.css';
import Link from 'next/link';
import { Button } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default class Footer extends React.Component {

    render() {
        return (
            <>
                <div className={styles.spacer}/>
                <footer className={styles.footer}>
                    <div className={styles.footerLinks}>
                        <div><a className={styles.link} href="mailto:avi.maayan@mssm.edu">Contact Us</a></div>
                        <div><Link href="/license"><a className={styles.link}>Usage License</a></Link></div>
                        <div><Link href="/targetscreener"><a className={styles.link}>Target Screener</a></Link></div>
                        <div><Link href="/api_documentation"><a className={styles.link}>API Documentation</a></Link></div>
                        <div><Link href="/download"><a className={styles.link}>Download</a></Link></div>
                    </div>
                    <div>
                        <a href="https://icahn.mssm.edu/research/bioinformatics" target="_blank" rel="noopener noreferrer"><img src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/icahn_cb.png"} alt="School Logo" width={137} height={80} /></a>
                    </div>
                    <div>
                        <a href="https://labs.icahn.mssm.edu/maayanlab/" target="_blank" rel="noopener noreferrer"><img style={{borderRadius: '10px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/maayanlab_logo.png"} alt="Lab Logo" width={80} height={80} /></a>
                    </div>
                    <div>
                        <a style={{textDecoration: 'none', color: 'black'}}href="https://youtu.be/_XM9NS4G1-4" target="_blank" rel="noopener noreferrer">
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                <YouTubeIcon/>
                                <div>Video Tutorial</div>
                            </div>
                            <img style={{borderRadius: '5px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/videoThumbnail.png"} alt="Video Thumbnail" width={137} height={80} />
                        </a>
                    </div>
                    <div className={styles.githubButtons}>
                        <a className={styles.buttonLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><img style={{borderRadius: '5px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GitHub-Mark.png"} alt="GitHub Logo" width={16} height={16} />&nbsp;View source code</Button></a>
                        <a className={styles.buttonLink} href="https://github.com/MaayanLab/single-gene-expression-dashboard/issues/new" target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary"><img style={{borderRadius: '5px'}} src={process.env.NEXT_PUBLIC_ENTRYPOINT + "/images/GitHub-Mark.png"} alt="GitHub Logo" width={16} height={16} />&nbsp;Submit an issue</Button></a>
                    </div>
                </footer>
            </>
            
        );
    }

}