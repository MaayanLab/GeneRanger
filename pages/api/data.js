const { PrismaClient, Prisma } = require("@prisma/client");

/** 
 * @swagger
 *  /api/data:
 *    post:
 *      summary: Access processed data
 *      description: Query for processed data by gene and resource. If the "databases" property is not included in the request body, all information regarding the chosen gene will be returned.
 *      requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gene:
 *                 type: string
 *                 description: The gene you would like to study.
 *                 example: A2M
 *               databases:
 *                 type: string
 *                 description: The resources to query, separated by commas
 *                 example: ARCHS4,GTEx_proteomics,Tabula_Sapiens,CCLE_transcriptomics,HPM,HPA,GTEx_proteomics,CCLE_proteomics
 *      responses:
 *        200:
 *          description: Data relating to the chosen gene from the chosen resources.
 *          content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allData:
 *                   type: object
 *                   properties:
 *                     gene:
 *                       type: string
 *                       description: The chosen gene used to query information.
 *                       example: A2M
 *                     dbData:
 *                       type: object
 *                       properties:
 *                         ARCHS4:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene 
 *                         GTEx_transcriptomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         Tabula_Sapiens:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_transcriptomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPM:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPA:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_proteomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_proteomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                     NCBI_data:
 *                       type: string
 *                       description: The NCBI description of the chosen gene.
 *                       example: The protein encoded by this gene is a protease inhibitor and cytokine transporter. It uses a bait-and-trap mechanism to inhibit a broad spectrum of proteases, including trypsin, thrombin and collagenase. It can also inhibit inflammatory cytokines, and it thus disrupts inflammatory cascades. Mutations in this gene are a cause of alpha-2-macroglobulin deficiency. This gene is implicated in Alzheimer's disease (AD) due to its ability to mediate the clearance and degradation of A-beta, the major component of beta-amyloid deposits. A related pseudogene, which is also located on the p arm of chromosome 12, has been identified.
 *
*/

/** 
 * @swagger
 *  /api/data:
 *    get:
 *      summary: Access processed data for gene A2M
 *      description: Query for all processed data relating to gene A2M
 *      responses:
 *        200:
 *          description: All data relating to the gene A2M.
 *          content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allData:
 *                   type: object
 *                   properties:
 *                     gene:
 *                       type: string
 *                       description: The chosen gene used to query information.
 *                       example: A2M
 *                     dbData:
 *                       type: object
 *                       properties:
 *                         ARCHS4:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene 
 *                         GTEx_transcriptomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         Tabula_Sapiens:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_transcriptomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPM:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPA:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_proteomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             median:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             q3:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             mean:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             sd:
 *                               type: array
 *                               example: [0, 0, 0]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             upperfence:
 *                               type: array
 *                               example: [1, 2, 3]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_proteomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [0, 0, 0]
 *                             names:
 *                               type: array
 *                               example: ["name1", "name2", "name3"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                     NCBI_data:
 *                       type: string
 *                       description: The NCBI description of the chosen gene.
 *                       example: The protein encoded by this gene is a protease inhibitor and cytokine transporter. It uses a bait-and-trap mechanism to inhibit a broad spectrum of proteases, including trypsin, thrombin and collagenase. It can also inhibit inflammatory cytokines, and it thus disrupts inflammatory cascades. Mutations in this gene are a cause of alpha-2-macroglobulin deficiency. This gene is implicated in Alzheimer's disease (AD) due to its ability to mediate the clearance and degradation of A-beta, the major component of beta-amyloid deposits. A related pseudogene, which is also located on the p arm of chromosome 12, has been identified.
 *
*/
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

                    data = {
                        q1: q1,
                        median: median,
                        q3: q3,
                        mean: mean,
                        sd: std,
                        lowerfence: lowerfence,
                        upperfence: upperfence,
                        names: names
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
                        descriptions = descriptions.map(description => description.replace('\n', ' - '));
                    }

                    const names = descriptions;

                    let data = {
                        levels: levels,
                        names: names
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

                    data = {
                        q1: q1,
                        median: median,
                        q3: q3,
                        mean: mean,
                        sd: std,
                        lowerfence: lowerfence,
                        upperfence: upperfence,
                        names: names
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
                        descriptions = descriptions.map(description => description.replace('\n', ' - '));
                    }

                    const names = descriptions;

                    let data = {
                        levels: levels,
                        names: names
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