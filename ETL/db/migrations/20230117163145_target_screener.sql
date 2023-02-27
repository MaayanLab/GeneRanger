-- migrate:up

create extension if not exists "plpython3u";

create function safe_log2fc(b numeric, a numeric) returns numeric as $$
  select case
    when b = 0 and a = 0 then 0.0
    when b = 0 and a <> 0 then 'infinity'::numeric
    when b <> 0 and a = 0 then '-infinity'::numeric
    else log(2, b) - log(2, a)
  end
$$ language sql immutable;

create type welchs_t_test_results AS (
  t double precision,
  p double precision
);

create function welchs_t_test(a_mean double precision, a_std double precision, a_n double precision, b_mean double precision, b_std double precision, b_n double precision, equal_var boolean, alternative varchar) returns welchs_t_test_results as $$
  import scipy.stats
  if a_mean is None or not a_std or not a_n or b_mean is None or not b_std or not b_n:
    return (None, None)
  result = scipy.stats.ttest_ind_from_stats(a_mean, a_std, a_n, b_mean, b_std, b_n, equal_var=equal_var, alternative=alternative)
  return (result.statistic, result.pvalue)
$$ language plpython3u immutable;

-- given stats of the form { mean: { desc1: value, desc2: value, ... }, std: {...}, count: {...} }
-- compute an aggregated distribution by:
--  mean(means)
--  sqrt(sum(std**2))
--  sum(count)
create function aggregate_stats(stats jsonb) returns jsonb as $$
  select jsonb_build_object(
    'mean',
    (
      select to_jsonb(avg(j.value::text::double precision))
      from jsonb_each(stats->'mean') j
    ),
    'std',
    (
      select to_jsonb(sqrt(sum(power(j.value::text::double precision,2))))
      from jsonb_each(stats->'std') j
    ),
    'count',
    (
      select to_jsonb(sum(j.value::text::double precision))
      from jsonb_each(stats->'count') j
    )
  )
$$ language sql immutable;

-- Here we store an aggregated version of data, this will be much
--  smaller and cheaper to query against. It must be refreshed if
--  data is added.
create materialized view database_agg as
select
  data.id as id,
  data.database as database,
  data.gene as gene,
  aggregate_stats(data.values) as values
from data;

create type screen_target_results AS (
  gene varchar,
  log2fc numeric,
  t double precision,
  p double precision
);

-- Usage:
-- ```sql
-- select *
-- from screen_targets(
--   '{"n": 5, "genes": {"STAT3": {"mean": 5400, "std": 16}, "ACE2": {"mean": 150, "std": 20}}}'::jsonb,
--   (
--     select database.id
--     from database
--     where database.dbname = 'ARCHS4'
--     limit 1
--   )
-- )
-- where p < 0.05
-- order by t desc;
-- ```
-- In JS:
-- ```sql
-- select *
-- from screen_targets(
--   ${input_data}::jsonb,
--   (
--     select database.id
--     from database
--     where database.dbname = ${input_database}
--     limit 1
--   )
-- )
-- where p < 0.05
-- order by t desc;
-- ```

create function screen_targets(input_data jsonb, background uuid) returns setof screen_target_results as $$
  with
  input_data_each as (
    select
      j.key as gene,
      j.value || jsonb_build_object('count', input_data->'n') as values
    from jsonb_each(input_data->'genes') as j
  ),
  input_background as (
    select
      input_data_each.gene,
      input_data_each.values as input_data,
      database_agg.values as background_data
    from input_data_each
    inner join gene on gene.gene = input_data_each.gene
    inner join database_agg on database_agg.gene = gene.id
    where database_agg.database = background
  ),
  stats as (
    select
      gene,
      safe_log2fc((input_data->>'mean')::numeric, (background_data->>'mean')::numeric) as log2fc,
      r.t as t,
      r.p as p
    from input_background
    cross join lateral welchs_t_test(
        (input_data->>'mean')::double precision,
        (input_data->>'std')::double precision,
        (input_data->>'count')::double precision,
        (background_data->>'mean')::double precision,
        (background_data->>'std')::double precision,
        (background_data->>'count')::double precision,
        false,
        'two-sided'
    ) as r
    where
      r.t > 0
  )
select *
from stats
$$ language sql immutable;

-- migrate:down
drop function screen_targets(jsonb, uuid);
drop type screen_target_results;
drop materialized view database_agg;
drop function aggregate_stats(jsonb);
drop function welchs_t_test(double precision, double precision, double precision, double precision, double precision, double precision, boolean, varchar);
drop type welchs_t_test_results;
drop function safe_log2fc(numeric, numeric);
