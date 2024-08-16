const { Prisma } = require("@prisma/client");
import prisma from '../../prisma/prisma';


export default async function handler(req, res) {

    if (req.method === 'POST') {

        try {

            const transcript = req.body.transcript;
            let databases = req.body.databases;

            var gene = '';

            let gene_desc = await prisma.$queryRaw
                `select
                    mapper.gene,
                    gene_info.*
                from 
                    gene_info,
                    mapper
                where mapper.transcript = ${transcript} and gene_info.symbol = mapper.gene
                `
            if (gene_desc.length != 0) {
                gene = gene_desc[0].gene
                gene_desc = gene_desc[0].summary;
                if (gene_desc.indexOf('[') != -1) {
                    gene_desc = gene_desc.substring(0, gene_desc.lastIndexOf('[') - 1)
                }
                if (gene == 'GUCA1A' && gene_desc.indexOf('provided') != -1) {
                    gene_desc = gene_desc.substring(0, gene_desc.indexOf('provided') - 1)
                }
                if (gene_desc == 'nan') {
                    gene_desc = "No gene description available."
                }
                if (gene_desc != '' && gene_desc.slice(-1) != '.') {
                    gene_desc = gene_desc + '.';
                }
            } else {
                gene_desc = "No gene description available."
            }

            let all_db_data = await prisma.$queryRaw
                `
                    select d.dbname, d.values as df
                    from data_complete d
                    where d.transcript = ${transcript}
                    ${
                        databases != undefined ? Prisma.sql`and d.dbname IN (${Prisma.join(databases)});` : Prisma.empty 
                    }
                `
            let sorted_data = {};

            for (let i in all_db_data) {
                let db = all_db_data[i].dbname;
                let df = all_db_data[i].df;
                if (db == 'GTEx_transcript' || db == 'ARCHS4_transcript') {
                    const descriptions = Object.keys(df.mean);
                    descriptions.sort((a, b) => df.mean[a] - df.mean[b]);
                    let names = descriptions;
                    const q1 = descriptions.map(description => df.q1[description] || null);
                    const median = descriptions.map(description => df.median[description] || null);
                    const q3 = descriptions.map(description => df.q3[description] || null);
                    const mean = descriptions.map(description => df.mean[description] || null);
                    const std = descriptions.map(description => df.std[description] || null);
                    const upperfence = descriptions.map(description => df.upperfence[description] || null);
                    const lowerfence = descriptions.map(description => df.lowerfence[description] || null);

                    // Dealing with dashes and underscores in the names
                    if (db == 'ARCHS4_transcript') {
                        names = names.map(name => name.replace('-', ' - '));
                    }

                    let data;

                    if (db == 'ARCHS4_transcript') {
                        data = {
                            q1: q1,
                            median: median,
                            q3: q3,
                            mean: mean,
                            lowerfence: lowerfence,
                            upperfence: upperfence,
                            names: names,
                            orientation: 'h',
                            type: 'box'
                        }
                    } else {
                        data = {
                            q1: q1,
                            median: median,
                            q3: q3,
                            mean: mean,
                            sd: std,
                            lowerfence: lowerfence,
                            upperfence: upperfence,
                            names: names,
                            orientation: 'h',
                            type: 'box'
                        }
                    }


                    Object.assign(sorted_data, { [db]: data });

                }
            }

            res.status(200).json({ allData: {'transcript': transcript, 'gene': gene, 'dbData': sorted_data, 'NCBI_data': gene_desc}  });
        } catch (err) {
            console.log(err)
            res.status(500).json({ Error: 'An error occurred.' })
        }
    }
}