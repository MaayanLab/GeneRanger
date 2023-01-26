-- migrate:up
create index database_agg_database_idx on database_agg (database);

-- migrate:down
drop index database_agg_database_idx;
