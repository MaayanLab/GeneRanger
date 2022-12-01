-- migrate:up

-- since we don't need to query by description/label/values specifically
--  we've collapsed them all into a jsonb field and kept gene/database.
-- we additionally normalized database/gene, on delete cascade is a convenience
--  that means if we delete a specific database, all data entries which depend
--  on that particular database will get deleted automatically as well.

-- this enables uuid fields & uuid_generate_v4. uuids are more convenient than
--  integers or something for a number of reasons I won't elaborate on here.
create extension if not exists "uuid-ossp";

-- ncbi-provided gene info
create table gene_info (
  id integer primary key,
  symbol varchar,
  synonyms jsonb,
  chromosome varchar,
  map_location varchar,
  description varchar,
  type_of_gene varchar,
  summary text
);

-- our data
create table database (
  id uuid primary key default uuid_generate_v4(),
  dbname varchar
);

create table gene (
  id uuid primary key default uuid_generate_v4(),
  gene varchar
);

create table data (
  id serial primary key,
  database uuid not null references database (id) on delete cascade,
  gene uuid not null references gene (id) on delete cascade,
  values jsonb not null,
  unique (database, gene)
);

-- This view joins the normalized tables into a table with all the information
--  we want (no uuids). Notably if we change our internal structure, we
--  can also update this view such that it remains invariant to those changes.
create view data_complete as
select
  database.dbname as dbname,
  gene.gene as gene,
  data.values
from data
left join database on data.database = database.id
left join gene on data.gene = gene.id;

-- You can now use this on the frontend with
--
--  select dbname, values as df from data_complete where gene = ${gene}
--


-- migrate:down

drop view data_complete;
drop table data;
drop table database;
drop table gene;
drop table gene_info;
