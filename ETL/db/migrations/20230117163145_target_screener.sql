-- migrate:up

create extension if not exists "plpython3u";

-- { a: { b: c, ... }, ... } => { b: { a: c, ... } }
create function jsonb_transpose(df jsonb) returns jsonb as $$
with
  flat as (
    select
      a.key as index, b.key as column, b.value as value
    from
      jsonb_each(df) as a
      cross join lateral jsonb_each(a.value) as b
  ),
  column_index_values as (
    select
      flat.column,
      jsonb_object_agg(flat.index, flat.value) as index_values
    from flat
    group by flat.column
  )
select jsonb_object_agg(column_index_values.column, column_index_values.index_values)
from column_index_values
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


create type screen_target_results AS (
  gene varchar,
  description varchar,
  t double precision,
  p double precision
);

-- Usage:
-- ```sql
-- select gene, description, t, p
-- from screen_targets(
--   '{"n": 5, "genes": {"STAT3": {"mean": 120, "std": 16}, "ACE2": {"mean": 150, "std": 20}}}'::jsonb,
--   (
--     select database.id
--     from database
--     where database.dbname = 'ARCHS4'
--     limit 1
--   )
-- );
-- ```
-- In JS:
-- ```sql
-- select gene, description, t, p
-- from screen_targets(
--   ${input_data}::jsonb,
--   (
--     select database.id
--     from database
--     where database.dbname = ${input_database}
--     limit 1
--   )
-- );
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
      j.key as description,
      input_data_each.values as input_data,
      j.value as background_data
    from input_data_each
    inner join gene on gene.gene = input_data_each.gene
    inner join data on data.gene = gene.id
    cross join lateral jsonb_each(jsonb_transpose(data.values)) j
    where data.database = background
  ),
  stats as (
    select
      gene,
      description,
      r.t as t,
      (1-r.p) as p
    from input_background
    cross join lateral welchs_t_test(
        (input_data->>'mean')::double precision,
        (input_data->>'std')::double precision,
        (input_data->>'count')::double precision,
        (background_data->>'mean')::double precision,
        (background_data->>'std')::double precision,
        (background_data->>'count')::double precision,
        false,
        'less'
    ) as r
  )
select *
from stats
$$ language sql immutable;

-- migrate:down
drop function screen_targets(jsonb, uuid) cascade;
drop type screen_target_results cascade;
drop function welchs_t_test(double precision, double precision, double precision, double precision, double precision, double precision, boolean, varchar) cascade;
drop type welchs_t_test_results cascade;
drop function jsonb_transpose(jsonb) cascade;
