import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {

    const prisma = new PrismaClient();

    const { gene } = req.body

    let all_db_data = {};

    const gtex_transcriptomics = await prisma.gtex_transcriptomics.findMany({
        where: {
            name: gene,
        },
    });
    Object.assign(all_db_data, {gtex_transcriptomics: gtex_transcriptomics});

    const archs4 = await prisma.archs4.findMany({
        where: {
            name: gene,
        },
    });
    Object.assign(all_db_data, {archs4: archs4});

    const tabula_sapiens = await prisma.tabula_sapiens.findMany({
        where: {
            name: gene,
        },
    });
    Object.assign(all_db_data, {tabula_sapiens: tabula_sapiens});

    const hpm = await prisma.hpm.findMany({
        where: {
            gene: gene,
        },
    });
    Object.assign(all_db_data, {hpm: hpm});

    const hpa = await prisma.hpa.findMany({
        where: {
            gene_name: gene,
        },
    });
    Object.assign(all_db_data, {hpa: hpa});


    const gtex_proteomics = await prisma.gtex_proteomics.findMany({
        where: {
            gene_id: gene,
        },
    });
    Object.assign(all_db_data, {gtex_proteomics: gtex_proteomics});

    // Getting NCBI gene description

    let esearch_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=' + gene + '[gene%20name]+human[organism]';
    let esummary_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=';

    const esearch_res = await fetch(esearch_url);
    let ids = await esearch_res.text();
    ids = ids.substring(ids.indexOf('<Id>'), ids.lastIndexOf('</Id>')).replaceAll('</Id>', ',').replaceAll('<Id>', '').replace(/(\r\n|\n|\r)/gm, "");
    const esummary_res = await fetch(esummary_url + ids);
    let NCBI_data = await esummary_res.text();
    let slicedStr = NCBI_data.substring(NCBI_data.indexOf('<Name>' + gene + '</Name>'));
    slicedStr = slicedStr.substring(slicedStr.indexOf('<Summary>'), slicedStr.indexOf('</Summary>')).replaceAll('<Summary>', '');
    NCBI_data = slicedStr.substring(0, slicedStr.lastIndexOf('[') - 1);

    // Converting character entities
    NCBI_data = NCBI_data.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&apos;', '\'').replaceAll('&copy;', '©').replaceAll('&reg;', '®');

    // If there isn't an NCBI description
    if (NCBI_data == "") NCBI_data = 'No gene description available.'

    res.status(200).json({ allData: {NCBI_data, all_db_data}  });

}