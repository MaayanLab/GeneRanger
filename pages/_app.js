import '../styles/globals.css'
import Head from 'next/head'
import { RuntimeConfig } from '../components/runtimeConfig'

const schema = {
  "@context": "http://schema.org",
  "@type": "WebSite",
  "url": "https://generanger.maayanlab.cloud/",
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": "https://generanger.maayanlab.cloud/gene/{query}?database=ARCHS4",
      "query-input": "required name=query"
    }
  ]
}


function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content="GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases."></meta>
        <meta name="title" content="GeneRanger: processed gene and protein expression levels"></meta>
        <meta property="og:title" content="GeneRanger: processed gene and protein expression levels"/>
        <meta property="og:type" content="website"/>
        <meta property="og:description" content="GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases."/>
        <meta property="og:url" content="https://generanger.maayanlab.cloud/"/>
        <meta property="og:image" content="https://raw.githubusercontent.com/MaayanLab/GeneRanger/main/public/images/logo.png"/>
        <meta name="keywords" content="harmonizome, archs4, ccle, gtex, data coordination and integration center,
                    biomedical, systems biology, drug discovery, gene signature,
                    genomics, transcriptomics, proteomics,
                    genes, proteins, cell lines, tissues, cell types, diseases, phenotypes, drugs, cancer, tumor, target, surface protein
                    maayan lab, avi ma'ayan, avi maayan, ma'ayan lab">
        </meta>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      <RuntimeConfig>
        <Component {...pageProps} />
      </RuntimeConfig>
    </>
  )
}

export default MyApp
