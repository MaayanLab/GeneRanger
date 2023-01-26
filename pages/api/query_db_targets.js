const { Prisma } = require("@prisma/client");
import prisma from '../../prisma/prisma';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb' // Set desired value here
        }
    }
}

export default async function handler(req, res) {

    if (req.method === 'POST') {
        
        const input = req.body;

        const databases = new Map([
            [0, 'ARCHS4'],
            [1, 'GTEx_transcriptomics'],
            [2, 'Tabula_Sapiens'],
            [3, 'CCLE_transcriptomics'],
            [4, 'HPM'],
            [5, 'HPA'],
            [6, 'GTEx_proteomics'],
            [7, 'CCLE_proteomics'],
        ]);

        const input_data = input['inputData']

        const bgNum = input['bg']
        const bg = databases.get(bgNum)
        
        let result = await prisma.$queryRaw
        `
            select gene, t, p, log2fc
            from screen_targets(
            ${input_data}::jsonb,
            (
                select database.id
                from database
                where database.dbname = ${bg}
                limit 1
            )
            )
            where p < 0.05
            order by t desc;
        `

        res.status(200).json(result);
    }
}



