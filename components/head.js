import * as React from 'react';
import Head from 'next/head';

export default class Header extends React.Component {

    render() {
        return (

            <Head>
                <title>GeneRanger</title>
                <link rel="icon" href="/images/logo.png" />
            </Head>
               
        );
    }

}