-- migrate:up
alter table database add column created timestamp default now();

-- migrate:down
alter table database drop column created;
