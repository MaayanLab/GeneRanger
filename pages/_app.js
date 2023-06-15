import '../styles/globals.css'
import Head from 'next/head'
import { RuntimeConfig } from '../components/runtimeConfig'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta property="og:title" content="GeneRanger"/>
        <meta property="og:type" content="website"/>
        <meta property="og:description" content="GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases."/>
        <meta property="og:url" content="https://generanger.maayanlab.cloud/"/>
        <meta property="og:image" content="https://raw.githubusercontent.com/MaayanLab/GeneRanger/main/public/images/logo.png"/>
      </Head>
      <RuntimeConfig>
        <Component {...pageProps} />
      </RuntimeConfig>
    </>
  )
}

export default MyApp
