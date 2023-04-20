-- migrate:up



create extension if not exists "plpython3u";

create materialized view database_agg_transcript as
select
  data_transcript.id as id,
  data_transcript.database as database,
  data_transcript.transcript as transcript,
  aggregate_stats(data_transcript.values) as values
from data_transcript;

create unique index database_agg_trancript_id_idx on database_agg_transcript (id);
create index database_agg_trancript_database_idx on database_agg_transcript (database);


create view mapper AS (
select
  gene.gene as gene,
  transcript.transcript as transcript
from gene_transcript
left join gene on gene_transcript.gene = gene.id
left join transcript on gene_transcript.transcript = transcript.id
);

create type welchs_t_test_vectorized_transcript_results AS (
  gene varchar,
  transcript varchar,
  log2fc double precision,
  t double precision,
  p double precision,
  adj_p double precision
);

-- Usage:
-- ```sql
-- select *
-- from screen_targets_transcript_vectorized(
--   '{"n": 5, "transcripts": {"ENST00011221.5": {"mean": 5400, "std": 16}, "ENST00012241.2": {"mean": 150, "std": 20}}}'::jsonb,
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
-- from screen_targets_transcript_vectorized(
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

create function screen_targets_transcript_vectorized(input_data jsonb, background uuid) returns setof welchs_t_test_vectorized_transcript_results as $$
  with
  input_data_each as (
    select
      j.key as transcript,
      j.value || jsonb_build_object('count', input_data->'n') as values
    from jsonb_each(input_data->'transcripts') as j
  ),
  input_background as (
    select
      input_data_each.transcript,
      input_data_each.values as input_data,
      database_agg_transcript.values as background_data
    from input_data_each
    inner join transcript on transcript.transcript = input_data_each.transcript
    inner join database_agg_transcript on database_agg_transcript.transcript = transcript.id
    where database_agg_transcript.database = background
  ),
  vectorized_stats as (
    select
      welchs_t_test_vectorized(
        array_agg(transcript),
        array_agg((input_data->>'mean')::double precision),
        array_agg((input_data->>'std')::double precision),
        array_agg((input_data->>'count')::double precision),
        array_agg((background_data->>'mean')::double precision),
        array_agg((background_data->>'std')::double precision),
        array_agg((background_data->>'count')::double precision),
        false,
        'two-sided',
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
    where
      r.t > 0
  ),
  stats_mapped as (
    select
      mapper.gene,
      stats.gene as transcript,
      stats.log2fc,
      stats.t,
      stats.p,
      stats.adj_p
    from stats
    left join mapper on stats.gene = mapper.transcript
  )
select *
from stats_mapped
$$ language sql immutable;

-- migrate:down

drop index database_agg_transcript_database_idx;
drop unique index database_agg_transcript_id_idx;
drop function screen_targets_transcript_vectorized(input_data jsonb, background uuid);
drop type welchs_t_test_vectorized_transcript_results;
drop view mapper;