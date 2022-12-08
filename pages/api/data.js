const { PrismaClient, Prisma } = require("@prisma/client");

export default async function handler(req, res) {

    const prisma = new PrismaClient();

    if (req.method === 'POST') {

        try {

            const gene = req.body.gene;
            let databases = req.body.databases;

            if (databases != undefined) {
                databases = databases.split(',');
            }

            let gene_desc = await prisma.$queryRaw`select * from gene_info where gene_info.symbol = ${gene}`
            if (gene_desc.length != 0) {
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
                where d.gene = ${gene} 
                ${
                    databases != undefined ? Prisma.sql`and d.dbname IN (${Prisma.join(databases)});` : Prisma.empty 
                }
            `

            let sorted_data = {};

            for (let i in all_db_data) {
                let db = all_db_data[i].dbname;
                let df = all_db_data[i].df;
                if (db == 'GTEx_transcriptomics' || db == 'ARCHS4' || db == 'Tabula_Sapiens' || db == 'GTEx_proteomics') {
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
                    if (db == 'ARCHS4') {
                        names = names.map(name => name.replace('-', ' - '));
                    }
                    if (db == 'Tabula_Sapiens') {
                        names = names.map(name => name.replace(/_+/g, ' ').replace('-', ' - '));
                    }
            
                    let data;

                    if (db == 'ARCHS4') {
                        data = {
                            q1: q1,
                            median: median,
                            q3: q3,
                            mean: mean,
                            lowerfence: lowerfence,
                            upperfence: upperfence,
                            y: names,
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
                            y: names,
                            orientation: 'h',
                            type: 'box'
                        }
                    }
                    

                    Object.assign(sorted_data, {[db]: data});

                } else if (db == 'HPM' || db == 'HPA' || db == 'CCLE_transcriptomics' || db == 'CCLE_proteomics') {
                    let descriptions = Object.keys(df.value);
                    if (db == 'HPA') {
                        const qualitative_map = {'Not detected': 0, 'Low': 1, 'Medium': 2, 'High': 3}
                        descriptions.sort((a, b) => qualitative_map[df.value[a]] - qualitative_map[df.value[b]]);
                    } else {
                        descriptions.sort((a, b) => df.value[a] - df.value[b]);
                    }  

                    const levels = descriptions.map(description => df.value[description]);

                    if (db == 'HPA') {
                        descriptions = descriptions.map(description => description.replace('\n', '<br>'));
                    }

                    const names = descriptions;

                    let data = {
                        x: levels,
                        y: names,
                        type: "scatter",
                        mode: "markers",
                        marker: { color: '#1f77b4' },
                    }
                    
                    Object.assign(sorted_data, {[db]: data});

                }
            }

            res.status(200).json({ allData: {'gene': gene, 'dbData': sorted_data, 'NCBI_data': gene_desc}  });

        } catch (err) {
            res.status(500).json({ Error: 'An error occurred.' })
        }

    } else if(req.method === 'GET') {

        try {

            let gene_desc = await prisma.$queryRaw`select * from gene_info where gene_info.symbol = 'A2M'`;
            if (gene_desc.length != 0) {
                gene_desc = gene_desc[0].summary;
                if (gene_desc.indexOf('[') != -1) {
                    gene_desc = gene_desc.substring(0, gene_desc.lastIndexOf('[') - 1)
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
                where d.gene = 'A2M';
            `

            let sorted_data = {};

            for (let i in all_db_data) {
                let db = all_db_data[i].dbname;
                let df = all_db_data[i].df;
                if (db == 'GTEx_transcriptomics' || db == 'ARCHS4' || db == 'Tabula_Sapiens' || db == 'GTEx_proteomics') {
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
                    if (db == 'ARCHS4') {
                        names = names.map(name => name.replace('-', ' - '));
                    }
                    if (db == 'Tabula_Sapiens') {
                        names = names.map(name => name.replace(/_+/g, ' ').replace('-', ' - '));
                    }
            
                    let data;

                    if (db == 'ARCHS4') {
                        data = {
                            q1: q1,
                            median: median,
                            q3: q3,
                            mean: mean,
                            lowerfence: lowerfence,
                            upperfence: upperfence,
                            y: names,
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
                            y: names,
                            orientation: 'h',
                            type: 'box'
                        }
                    }
                    

                    Object.assign(sorted_data, {[db]: data});

                } else if (db == 'HPM' || db == 'HPA' || db == 'CCLE_transcriptomics' || db == 'CCLE_proteomics') {
                    let descriptions = Object.keys(df.value);
                    if (db == 'HPA') {
                        const qualitative_map = {'Not detected': 0, 'Low': 1, 'Medium': 2, 'High': 3}
                        descriptions.sort((a, b) => qualitative_map[df.value[a]] - qualitative_map[df.value[b]]);
                    } else {
                        descriptions.sort((a, b) => df.value[a] - df.value[b]);
                    }  

                    const levels = descriptions.map(description => df.value[description]);

                    if (db == 'HPA') {
                        descriptions = descriptions.map(description => description.replace('\n', '<br>'));
                    }

                    const names = descriptions;

                    let data = {
                        x: levels,
                        y: names,
                        type: "scatter",
                        mode: "markers",
                        marker: { color: '#1f77b4' },
                    }
                    
                    Object.assign(sorted_data, {[db]: data});

                }
            }

            res.status(200).json({ allData: {'gene': 'A2M', 'dbData': sorted_data, 'NCBI_data': gene_desc}  });

        } catch (err) {
            res.status(500).json({ Error: 'An error occurred.' })
        }

        
    }
}