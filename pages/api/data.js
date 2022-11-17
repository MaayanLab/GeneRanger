import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {

    if (req.method === 'POST') {

        const { gene } = req.body

        const prisma = new PrismaClient();

        let gene_desc = await prisma.$queryRaw`select * from gene where gene.symbol = ${gene}`
        if (gene_desc.length != 0) {
            gene_desc = gene_desc[0].description;
        } else {
            gene_desc = "No gene description available."
        }
        
        let all_db_data = await prisma.$queryRaw
        `
            with cte as (
                select
                d.dbname,
                d.label,
                jsonb_object_agg(
                    d.description,
                    coalesce(to_jsonb(d.num_value), to_jsonb(d.str_value))
                ) as df
                from data d
                where d.gene = ${gene}
                group by d.dbname, d.label
            )
            select
                d.dbname,
                jsonb_object_agg(d.label, d.df) as df
            from cte d
            group by d.dbname;
        `

        let sorted_data = {};

        for (let i in all_db_data) {
            let db = all_db_data[i].dbname;
            let df = all_db_data[i].df;
            if (db == 'GTEx_transcriptomics' || db == 'ARCHS4' || db == 'Tabula_Sapiens' || db == 'GTEx_proteomics') {
                const descriptions = Object.keys(df.mean);
                descriptions.sort((a, b) => df.mean[a] - df.mean[b]);
                let names = descriptions;
                names = names.map(name => name.replace(/_+/g, ' ').replaceAll('.', ' ').replace('-', ' ').trim());
                const q1 = descriptions.map(description => df.q1[description]);
                const median = descriptions.map(description => df.median[description]);
                const q3 = descriptions.map(description => df.q3[description]);
                const mean = descriptions.map(description => df.mean[description]);
                const std = descriptions.map(description => df.std[description]);
                const upperfence = descriptions.map(description => df.upperfence[description]);
                const lowerfence = descriptions.map(description => df.lowerfence[description]);
        
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

        res.status(200).json({ allData: {'gene': gene, 'sorted_data': sorted_data, 'NCBI_data': gene_desc}  });

    } else if(req.method === 'GET') {

        const prisma = new PrismaClient();

        let gene_desc = await prisma.$queryRaw`select * from gene where gene.symbol = 'A2M'`
        if (gene_desc.length != 0) {
            gene_desc = gene_desc[0].description;
        } else {
            gene_desc = "No gene description available."
        }
        
        let all_db_data = await prisma.$queryRaw
        `
            with cte as (
                select
                d.dbname,
                d.label,
                jsonb_object_agg(
                    d.description,
                    coalesce(to_jsonb(d.num_value), to_jsonb(d.str_value))
                ) as df
                from data d
                where d.gene = 'A2M'
                group by d.dbname, d.label
            )
            select
                d.dbname,
                jsonb_object_agg(d.label, d.df) as df
            from cte d
            group by d.dbname;
        `

        let sorted_data = {};

        for (let i in all_db_data) {
            let db = all_db_data[i].dbname;
            let df = all_db_data[i].df;
            if (db == 'GTEx_transcriptomics' || db == 'ARCHS4' || db == 'Tabula_Sapiens' || db == 'GTEx_proteomics') {
                const descriptions = Object.keys(df.mean);
                descriptions.sort((a, b) => df.mean[a] - df.mean[b]);
                let names = descriptions;
                names = names.map(name => name.replace(/_+/g, ' ').replaceAll('.', ' ').replace('-', ' ').trim());
                const q1 = descriptions.map(description => df.q1[description]);
                const median = descriptions.map(description => df.median[description]);
                const q3 = descriptions.map(description => df.q3[description]);
                const mean = descriptions.map(description => df.mean[description]);
                const std = descriptions.map(description => df.std[description]);
                const upperfence = descriptions.map(description => df.upperfence[description]);
                const lowerfence = descriptions.map(description => df.lowerfence[description]);
        
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

        res.status(200).json({ allData: {'gene': 'A2M', 'sorted_data': sorted_data, 'NCBI_data': gene_desc}  });
    }
}