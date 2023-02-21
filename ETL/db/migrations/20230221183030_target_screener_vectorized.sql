-- migrate:up

create extension if not exists "plpython3u";

create type welchs_t_test_vectorized_results AS (
  gene varchar,
  log2fc double precision,
  t double precision,
  p double precision,
  adj_p double precision
);

create function welchs_t_test_vectorized(
  genes varchar[],
  a_mean double precision[],
  a_std double precision[],
  a_n double precision[],
  b_mean double precision[],
  b_std double precision[],
  b_n double precision[],
  ttest_equal_var boolean,
  ttest_alternative varchar,
  p_adjust_alpha double precision,
  p_adjust_method varchar
) returns welchs_t_test_vectorized_results[] as $$
  import numpy as np
  import scipy.stats
  import statsmodels.stats.multitest

  n = len(genes)
  np_a_mean = np.array(a_mean)
  np_a_std = np.array(a_std)
  np_a_n = np.array(a_n)
  np_b_mean = np.array(b_mean)
  np_b_std = np.array(b_std)
  np_b_n = np.array(b_n)

  np_a_mean_is_zero = np.isclose(np_a_mean, 0.)
  np_b_mean_is_zero = np.isclose(np_b_mean, 0.)
  np_a_and_b_are_nonzero = ~np_a_mean_is_zero & ~np_b_mean_is_zero
  log2fc = np.zeros(n)
  log2fc[np_a_mean_is_zero & np_b_mean_is_zero] = 0.
  log2fc[np_a_mean_is_zero & ~np_b_mean_is_zero] = -np.inf
  log2fc[~np_a_mean_is_zero & np_b_mean_is_zero] = np.inf
  log2fc[np_a_and_b_are_nonzero] = (
    np.log2(np_b_mean[np_a_and_b_are_nonzero])
    - np.log2(np_a_mean[np_a_and_b_are_nonzero])
  )
  
  mask = ~(
    np.isnan(np_a_mean)
    |np.isnan(np_a_std)|np.isclose(np_a_std, 0.)
    |np.isnan(np_a_n)|np.isclose(np_a_n, 0.)
    |np.isnan(np_b_mean)
    |np.isnan(np_b_std)|np.isclose(np_b_std, 0.)
    |np.isnan(np_b_n)|np.isclose(np_b_n, 0.)
  )
  result = scipy.stats.ttest_ind_from_stats(
    np_a_mean[mask], np_a_std[mask], np_a_n[mask],
    np_b_mean[mask], np_b_std[mask], np_b_n[mask],
    equal_var=ttest_equal_var, alternative=ttest_alternative,
  )
  tstats = result.statistic
  pvals = result.pvalue

  try:
    reject, adj_pvals, alphacSidak, alphacBonf = statsmodels.stats.multitest.multipletests(
      pvals,
      p_adjust_alpha,
      p_adjust_method,
    )
  except:
    adj_pvals = np.nan

  results = np.zeros((n, 4))
  results[~mask, :] = np.nan
  results[:, 0] = log2fc
  results[mask, 1] = tstats
  results[mask, 2] = pvals
  results[mask, 3] = adj_pvals
  return [
    (gene, log2fc, t, p, adj_p)
    for gene, (log2fc, t, p, adj_p) in zip(genes, results)
  ]
$$ language plpython3u immutable;

-- Here we store an aggregated version of data, this will be much
--  smaller and cheaper to query against. It must be refreshed if
--  data is added.
create materialized view if not exists database_agg as
select
  data.id as id,
  data.database as database,
  data.gene as gene,
  aggregate_stats(data.values) as values
from data;

-- Usage:
-- ```sql
-- select *
-- from screen_targets_vectorized(
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
-- from screen_targets_vectorized(
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

create function screen_targets_vectorized(input_data jsonb, background uuid) returns setof welchs_t_test_vectorized_results as $$
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
  vectorized_stats as (
    select
      welchs_t_test_vectorized(
        array_agg(gene),
        array_agg((input_data->>'mean')::double precision),
        array_agg((input_data->>'std')::double precision),
        array_agg((input_data->>'count')::double precision),
        array_agg((background_data->>'mean')::double precision),
        array_agg((background_data->>'std')::double precision),
        array_agg((background_data->>'count')::double precision),
        false,
        'greater',
        0.05,
        'fdr_bh'
      ) as value
    from input_background
  ),
  stats as (
    select r.*
    from
      vectorized_stats,
      unnest(vectorized_stats.value) r
  )
select *
from stats
$$ language sql immutable;

-- migrate:down

drop function screen_targets_vectorized(input_data jsonb, background uuid);
drop function welchs_t_test_vectorized(varchar[],double precision[],double precision[],double precision[],double precision[],double precision[],double precision[],boolean,varchar,double precision,varchar);
drop type welchs_t_test_vectorized_results;
