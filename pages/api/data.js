const { Prisma } = require("@prisma/client");
import prisma from '../../prisma/prisma';

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
 *                 type: array
 *                 description: The resources to query, separated by commas
 *                 example: ['ARCHS4', 'GTEx_transcriptomics', 'Tabula_Sapiens', 'CCLE_transcriptomics', 'HPM', 'HPA', 'GTEx_proteomics', 'CCLE_proteomics']
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
 *                               example: [9,19,10450.2]
 *                             median:
 *                               type: array
 *                               example: [3541,31185,82093]
 *                             q3:
 *                               type: array
 *                               example: [75970,77016.5,230069]
 *                             mean:
 *                               type: array
 *                               example: [47123,54065.9,161205]
 *                             sd:
 *                               type: array
 *                               example: [80707.4,69564.7,215145]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [null,null,null]
 *                             upperfence:
 *                               type: array
 *                               example: [189911.5,192512.75,559497.2]
 *                             names:
 *                               type: array
 *                               example: ["cell line - melanocyte","tissue - biliary","cell line - hepg2"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_transcriptomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [104272,132609,271129]
 *                             median:
 *                               type: array
 *                               example: [139566,169494,379728]
 *                             q3:
 *                               type: array
 *                               example: [194508,216170,498696]
 *                             mean:
 *                               type: array
 *                               example: [157822,183111,412497]
 *                             sd:
 *                               type: array
 *                               example: [83035.9,74648.3,193384]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [37167,58613,46343]
 *                             upperfence:
 *                               type: array
 *                               example: [329862,341511.5,840046.5]
 *                             names:
 *                               type: array
 *                               example: ["Artery - Coronary","Artery - Aorta","Lung"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         Tabula_Sapiens:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [19625,19460,33807.5]
 *                             median:
 *                               type: array
 *                               example: [19625,26573,42541]
 *                             q3:
 *                               type: array
 *                               example: [19625,33686,51274.5]
 *                             mean:
 *                               type: array
 *                               example: [19625,26573,42541]
 *                             sd:
 *                               type: array
 *                               example: [null,14226,17467]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [19625,12347,25074]
 *                             upperfence:
 *                               type: array
 *                               example: [19625,40799,60008]
 *                             names:
 *                               type: array
 *                               example: ["Uterus - endothelial cell","Vasculature - smooth muscle cell","Fat - endothelial cell"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_transcriptomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [351680,361900,876110]
 *                             names:
 *                               type: array
 *                               example: ["HMY1","HEPG2","HS860T"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPM:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [893.9902027201,989.2300193915,1610.9621456553]
 *                             names:
 *                               type: array
 *                               example: ["Monocytes","Adult Gallbladder","Adult Lung"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPA:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: ["Medium","High","High"]
 *                             names:
 *                               type: array
 *                               example: ["cells in endometrial stroma, - endometrium 2","endothelial cells, - colon","endothelial cells, - cerebral cortex"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_proteomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [0.975,0.8400000000000001,1.2425]
 *                             median:
 *                               type: array
 *                               example: [1.3,1.085,1.455]
 *                             q3:
 *                               type: array
 *                               example: [1.91,1.6525,1.6675]
 *                             mean:
 *                               type: array
 *                               example: [1.258571428571429,1.3233333333333337,1.455]
 *                             sd:
 *                               type: array
 *                               example: [1.084703163257558,0.6984172582823729,0.6010407640085653]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [-0.4274999999999999,0.68,1.03]
 *                             upperfence:
 *                               type: array
 *                               example: [2.52,2.49,1.88]
 *                             names:
 *                               type: array
 *                               example: ["Vagina","Nerve - Tibial","Artery - Coronary"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_proteomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [3.65485734862368,3.90554376805634,5.05186115939223]
 *                             names:
 *                               type: array
 *                               example: ["KNS42","A172","RH30"]
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
 *                               example: [9,19,10450.2]
 *                             median:
 *                               type: array
 *                               example: [3541,31185,82093]
 *                             q3:
 *                               type: array
 *                               example: [75970,77016.5,230069]
 *                             mean:
 *                               type: array
 *                               example: [47123,54065.9,161205]
 *                             sd:
 *                               type: array
 *                               example: [80707.4,69564.7,215145]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [null,null,null]
 *                             upperfence:
 *                               type: array
 *                               example: [189911.5,192512.75,559497.2]
 *                             names:
 *                               type: array
 *                               example: ["cell line - melanocyte","tissue - biliary","cell line - hepg2"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_transcriptomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [104272,132609,271129]
 *                             median:
 *                               type: array
 *                               example: [139566,169494,379728]
 *                             q3:
 *                               type: array
 *                               example: [194508,216170,498696]
 *                             mean:
 *                               type: array
 *                               example: [157822,183111,412497]
 *                             sd:
 *                               type: array
 *                               example: [83035.9,74648.3,193384]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [37167,58613,46343]
 *                             upperfence:
 *                               type: array
 *                               example: [329862,341511.5,840046.5]
 *                             names:
 *                               type: array
 *                               example: ["Artery - Coronary","Artery - Aorta","Lung"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         Tabula_Sapiens:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [19625,19460,33807.5]
 *                             median:
 *                               type: array
 *                               example: [19625,26573,42541]
 *                             q3:
 *                               type: array
 *                               example: [19625,33686,51274.5]
 *                             mean:
 *                               type: array
 *                               example: [19625,26573,42541]
 *                             sd:
 *                               type: array
 *                               example: [null,14226,17467]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [19625,12347,25074]
 *                             upperfence:
 *                               type: array
 *                               example: [19625,40799,60008]
 *                             names:
 *                               type: array
 *                               example: ["Uterus - endothelial cell","Vasculature - smooth muscle cell","Fat - endothelial cell"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_transcriptomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [351680,361900,876110]
 *                             names:
 *                               type: array
 *                               example: ["HMY1","HEPG2","HS860T"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPM:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [893.9902027201,989.2300193915,1610.9621456553]
 *                             names:
 *                               type: array
 *                               example: ["Monocytes","Adult Gallbladder","Adult Lung"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         HPA:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: ["Medium","High","High"]
 *                             names:
 *                               type: array
 *                               example: ["cells in endometrial stroma, - endometrium 2","endothelial cells, - colon","endothelial cells, - cerebral cortex"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_proteomics:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [0.975,0.8400000000000001,1.2425]
 *                             median:
 *                               type: array
 *                               example: [1.3,1.085,1.455]
 *                             q3:
 *                               type: array
 *                               example: [1.91,1.6525,1.6675]
 *                             mean:
 *                               type: array
 *                               example: [1.258571428571429,1.3233333333333337,1.455]
 *                             sd:
 *                               type: array
 *                               example: [1.084703163257558,0.6984172582823729,0.6010407640085653]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [-0.4274999999999999,0.68,1.03]
 *                             upperfence:
 *                               type: array
 *                               example: [2.52,2.49,1.88]
 *                             names:
 *                               type: array
 *                               example: ["Vagina","Nerve - Tibial","Artery - Coronary"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         CCLE_proteomics:
 *                           type: object
 *                           properties:
 *                             levels:
 *                               type: array
 *                               example: [3.65485734862368,3.90554376805634,5.05186115939223]
 *                             names:
 *                               type: array
 *                               example: ["KNS42","A172","RH30"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                     NCBI_data:
 *                       type: string
 *                       description: The NCBI description of the chosen gene.
 *                       example: The protein encoded by this gene is a protease inhibitor and cytokine transporter. It uses a bait-and-trap mechanism to inhibit a broad spectrum of proteases, including trypsin, thrombin and collagenase. It can also inhibit inflammatory cytokines, and it thus disrupts inflammatory cascades. Mutations in this gene are a cause of alpha-2-macroglobulin deficiency. This gene is implicated in Alzheimer's disease (AD) due to its ability to mediate the clearance and degradation of A-beta, the major component of beta-amyloid deposits. A related pseudogene, which is also located on the p arm of chromosome 12, has been identified.
 *
*/

/** 
 * @swagger
 *  /api/data_transcript:
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
 *               transcript:
 *                 type: string
 *                 description: The gene you would like to study.
 *                 example: ENST00000495442
 *               databases:
 *                 type: array
 *                 description: The resources to query, separated by commas
 *                 example: ['ARCHS4_transcript', 'GTEx_transcript']
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
 *                       example: ENST00000495442
 *                     dbData:
 *                       type: object
 *                       properties:
 *                         ARCHS4_transcript:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [9,19,10450.2]
 *                             median:
 *                               type: array
 *                               example: [3541,31185,82093]
 *                             q3:
 *                               type: array
 *                               example: [75970,77016.5,230069]
 *                             mean:
 *                               type: array
 *                               example: [47123,54065.9,161205]
 *                             sd:
 *                               type: array
 *                               example: [80707.4,69564.7,215145]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [null,null,null]
 *                             upperfence:
 *                               type: array
 *                               example: [189911.5,192512.75,559497.2]
 *                             names:
 *                               type: array
 *                               example: ["cell line - melanocyte","tissue - biliary","cell line - hepg2"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                         GTEx_transcript:
 *                           type: object
 *                           properties:
 *                             q1:
 *                               type: array
 *                               example: [104272,132609,271129]
 *                             median:
 *                               type: array
 *                               example: [139566,169494,379728]
 *                             q3:
 *                               type: array
 *                               example: [194508,216170,498696]
 *                             mean:
 *                               type: array
 *                               example: [157822,183111,412497]
 *                             sd:
 *                               type: array
 *                               example: [83035.9,74648.3,193384]                            
 *                             lowerfence:
 *                               type: array
 *                               example: [37167,58613,46343]
 *                             upperfence:
 *                               type: array
 *                               example: [329862,341511.5,840046.5]
 *                             names:
 *                               type: array
 *                               example: ["Artery - Coronary","Artery - Aorta","Lung"]
 *                               description: The cell lines/cell types/tissues relating to the chosen gene
 *                     NCBI_data:
 *                       type: string
 *                       description: The NCBI description of the chosen gene.
 *                       example: The protein encoded by this gene is a protease inhibitor and cytokine transporter. It uses a bait-and-trap mechanism to inhibit a broad spectrum of proteases, including trypsin, thrombin and collagenase. It can also inhibit inflammatory cytokines, and it thus disrupts inflammatory cascades. Mutations in this gene are a cause of alpha-2-macroglobulin deficiency. This gene is implicated in Alzheimer's disease (AD) due to its ability to mediate the clearance and degradation of A-beta, the major component of beta-amyloid deposits. A related pseudogene, which is also located on the p arm of chromosome 12, has been identified.
 *
*/


export default async function handler(req, res) {

    if (req.method === 'POST') {

        try {

            const gene = req.body.gene;
            let databases = req.body.databases;

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