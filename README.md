# GeneRanger

<https://generanger.maayanlab.cloud>

GeneRanger is a web-server application that provides access to processed data about the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases.

## Getting Started
1. Create and ingest DB, see [ETL Instructions](ETL/README.md)
2. Copy ETL .env to root directory `cp ETL/.env .`
3. Run this webserver locally with:
```bash
# requires npm version 16~22
npm i
npm run dev
```
