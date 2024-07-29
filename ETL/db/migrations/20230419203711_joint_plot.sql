-- migrate:up

-- {mean, std, count}[] => {mean, std, count}
create function agg_mean_std_count(stats jsonb) returns jsonb as $$
  if not stats: return None
  import numpy as np
  import pandas as pd
  import json

  def combined_mean(means, ns):
    if ns.sum() == 0: return float('nan')
    return (means * ns).sum() / ns.sum()

  def combined_std(stds, ns, means):
    if ns.sum() == 0: return float('nan')
    mean = combined_mean(means, ns)
    ds = means - mean
    return (((ns*stds**2).sum() + (ns*ds**2).sum()) / ns.sum())**(1/2)

  stats_df = pd.DataFrame(json.loads(stats)).dropna()
  return pd.Series({
    'mean': combined_mean(stats_df['mean'], stats_df['count']),
    'std': combined_std(stats_df['std'], stats_df['count'], stats_df['mean']),
    'count': stats_df['count'].sum(),
  }).to_json()
$$ language plpython3u immutable;

-- We aggregate all {mean, std, count} in a database, to capture the global mean & variance across all tissues
create materialized view database_dist as
select database, agg_mean_std_count(jsonb_agg(values)) as dist
from database_agg
group by database;

create table unified_term_map (
  id uuid primary key default uuid_generate_v4(),
  original_term varchar,
  term varchar
);

create index on unified_term_map (original_term);

-- select unified_data_complete('ACE2', '{"GTEx_proteomics", "GTEx_transcriptomics"}'::varchar[]);
-- returns: { database: { stat: { unified_term: value, ... }, ..., ... }
create function unified_data_complete(gene varchar, dbnames varchar[]) returns jsonb as $$
with cte as (
  select
    db.dbname,
    dtv."desc" as "desc",
    jsonb_object_agg(
      utm."term",
      ((tv."value"::double precision) - (dd.dist->>'mean')::double precision) / (dd.dist->>'std')::double precision
    ) as "term_value"
  from
    unnest(dbnames) dbn (dbname)
    inner join database db on db.dbname = dbn.dbname
    inner join database_dist dd on dd.database = db.id
    inner join data d on d.database = db.id
    inner join gene g on d.gene = g.id,
    jsonb_each(d."values") as dtv("desc", "term_value"),
    jsonb_each_text(dtv."term_value") as tv("term", "value")
    inner join unified_term_map utm on tv."term" = utm."original_term"
  where g.gene = $1
  group by db.dbname, dtv."desc"
), cte2 as (
  select cte."dbname", jsonb_object_agg(cte."desc", cte."term_value") as "values"
  from cte
  group by dbname
) select jsonb_object_agg("dbname", "values") from cte2;
$$ language sql immutable;


-- migrate:down

drop table unified_term_map;
drop function unified_data_complete(varchar, varchar[]);
drop materialized view database_dist;
drop function agg_mean_std_count(jsonb);
