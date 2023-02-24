-- migrate:up
create unique index database_agg_id_idx on database_agg (id);
create index database_agg_database_idx on database_agg (database);

-- migrate:down
drop index database_agg_database_idx;
drop unique index database_agg_id_idx;
