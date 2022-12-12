-- migrate:up
create extension if not exists pg_trgm;

-- btree: faster sorting & lookups for gene symbol => summary
create index if not exists gene_info_symbol_idx on gene_info (symbol);

-- btree: faster sorting & lookups on gene field (autocomplete)
create index if not exists gene_gene_idx on gene (gene);
-- trgm: faster prefix matching (autocomplete)
create index if not exists gene_gene_trgm_idx on gene using gin (gene gin_trgm_ops);

-- faster joins to gene/database (data_complete)
create index if not exists data_database_fkey on data (database);
create index if not exists data_gene_fkey on data (gene);


-- migrate:down

drop index gene_info_symbol_idx;
drop index gene_gene_idx;
drop index gene_gene_trgm_idx;
drop index data_database_fkey;
drop index data_gene_fkey;
