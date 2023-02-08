import '../styles/globals.css'
import Head from 'next/head'
import { RuntimeConfig } from '../components/runtimeConfig'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <RuntimeConfig>
        <Component {...pageProps} />
      </RuntimeConfig>
    </>
  )
}

export default MyApp
