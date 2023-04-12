import prisma from '../../prisma/prisma';

export default async function handler(req, res) {

    if (req.method === 'POST') {

        const { input } = req.body;

        let transcripts = await prisma.$queryRaw`SELECT transcript FROM transcript WHERE LOWER(transcript) LIKE LOWER(CONCAT(${input}, '%')) ORDER BY transcript ASC LIMIT 8;`

        transcripts = transcripts.map(x => x.transcript);

        res.status(200).json(transcripts);

    }
}