SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgraphile_watch; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA postgraphile_watch;


--
-- Name: plpython3u; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpython3u WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpython3u; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpython3u IS 'PL/Python3U untrusted procedural language';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: cell_line_results; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cell_line_results AS (
	cell_line character varying,
	pcc double precision
);


--
-- Name: screen_target_results; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.screen_target_results AS (
	gene character varying,
	log2fc numeric,
	t double precision,
	p double precision
);


--
-- Name: welchs_t_test_results; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.welchs_t_test_results AS (
	t double precision,
	p double precision
);


--
-- Name: welchs_t_test_vectorized_results; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.welchs_t_test_vectorized_results AS (
	gene character varying,
	log2fc double precision,
	t double precision,
	p double precision,
	adj_p double precision
);


--
-- Name: welchs_t_test_vectorized_transcript_results; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.welchs_t_test_vectorized_transcript_results AS (
	gene character varying,
	transcript character varying,
	log2fc double precision,
	t double precision,
	p double precision,
	adj_p double precision
);


--
-- Name: notify_watchers_ddl(); Type: FUNCTION; Schema: postgraphile_watch; Owner: -
--

CREATE FUNCTION postgraphile_watch.notify_watchers_ddl() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'ddl',
      'payload',
      (select json_agg(json_build_object('schema', schema_name, 'command', command_tag)) from pg_event_trigger_ddl_commands() as x)
    )::text
  );
end;
$$;


--
-- Name: notify_watchers_drop(); Type: FUNCTION; Schema: postgraphile_watch; Owner: -
--

CREATE FUNCTION postgraphile_watch.notify_watchers_drop() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'drop',
      'payload',
      (select json_agg(distinct x.schema_name) from pg_event_trigger_dropped_objects() as x)
    )::text
  );
end;
$$;


--
-- Name: agg_mean_std_count(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.agg_mean_std_count(stats jsonb) RETURNS jsonb
    LANGUAGE plpython3u IMMUTABLE
    AS $$
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
$$;


--
-- Name: aggregate_stats(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.aggregate_stats(stats jsonb) RETURNS jsonb
    LANGUAGE sql IMMUTABLE
    AS $$
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
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data (
    id integer NOT NULL,
    database uuid NOT NULL,
    gene uuid NOT NULL,
    "values" jsonb NOT NULL
);


--
-- Name: data_transcript; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_transcript (
    id integer NOT NULL,
    database uuid NOT NULL,
    transcript uuid NOT NULL,
    "values" jsonb NOT NULL
);


--
-- Name: database; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.database (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    dbname character varying,
    created timestamp without time zone DEFAULT now()
);


--
-- Name: gene; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gene (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    gene character varying
);


--
-- Name: transcript; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transcript (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    transcript character varying
);


--
-- Name: data_complete; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.data_complete AS
 SELECT database.dbname,
    gene.gene,
    COALESCE(data."values", data_transcript."values") AS "values",
    transcript.transcript
   FROM ((((public.database
     LEFT JOIN public.data ON ((data.database = database.id)))
     LEFT JOIN public.gene ON ((data.gene = gene.id)))
     LEFT JOIN public.data_transcript ON ((data_transcript.database = database.id)))
     LEFT JOIN public.transcript ON ((data_transcript.transcript = transcript.id)));


--
-- Name: cell_line_ppc_vectorized(double precision[], public.data_complete[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cell_line_ppc_vectorized(a_mean double precision[], input_background public.data_complete[]) RETURNS public.cell_line_results[]
    LANGUAGE plpython3u IMMUTABLE
    AS $$
  import numpy as np
  import json

  cell_lines_dict = {}

  gene_order = []

  for d in input_background:
    expr = json.loads(d['values'])['value']
    gene = d['gene']
    for cl in expr:
      if cl not in cell_lines_dict:
        cell_lines_dict[cl] = []
      cell_lines_dict[cl].append(expr[cl])

  result = []
  for cell_line in cell_lines_dict:
      result.append((cell_line, np.corrcoef(np.log(np.array(a_mean) + 1), np.log(np.array(cell_lines_dict[cell_line]) + 1))[0][1]))

  return result
$$;


--
-- Name: safe_log2fc(numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.safe_log2fc(b numeric, a numeric) RETURNS numeric
    LANGUAGE sql IMMUTABLE
    AS $$
  select case
    when b = 0 and a = 0 then 0.0
    when b = 0 and a <> 0 then 'infinity'::numeric
    when b <> 0 and a = 0 then '-infinity'::numeric
    else log(2, b) - log(2, a)
  end
$$;


--
-- Name: screen_cell_lines_vectorized(jsonb, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.screen_cell_lines_vectorized(input_data jsonb, background character varying) RETURNS SETOF public.cell_line_results
    LANGUAGE sql IMMUTABLE
    AS $$
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
      data_complete as background_data
    from input_data_each
    inner join gene on gene.gene = input_data_each.gene
    inner join data_complete on data_complete.gene = gene.gene
    where data_complete.dbname = background
  ),
  vectorized_stats as (
    select
      cell_line_ppc_vectorized(
        array_agg((input_data->>'mean')::double precision),
        array_agg((background_data)::data_complete)
      ) as value
    from input_background
  ),
  stats as (
    select r.*
    from
      vectorized_stats,
      unnest(vectorized_stats.value) r
    where
      r.pcc >= 0
  )
select *
from stats
$$;


--
-- Name: screen_targets(jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.screen_targets(input_data jsonb, background uuid) RETURNS SETOF public.screen_target_results
    LANGUAGE sql IMMUTABLE
    AS $$
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
$$;


--
-- Name: screen_targets_transcript_vectorized(jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.screen_targets_transcript_vectorized(input_data jsonb, background uuid) RETURNS SETOF public.welchs_t_test_vectorized_transcript_results
    LANGUAGE sql IMMUTABLE
    AS $$
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
$$;


--
-- Name: screen_targets_vectorized(jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.screen_targets_vectorized(input_data jsonb, background uuid) RETURNS SETOF public.welchs_t_test_vectorized_results
    LANGUAGE sql IMMUTABLE
    AS $$
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
  )
select *
from stats
$$;


--
-- Name: unified_data_complete(character varying, character varying[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.unified_data_complete(gene character varying, dbnames character varying[]) RETURNS jsonb
    LANGUAGE sql IMMUTABLE
    AS $_$
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
$_$;


--
-- Name: welchs_t_test(double precision, double precision, double precision, double precision, double precision, double precision, boolean, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.welchs_t_test(a_mean double precision, a_std double precision, a_n double precision, b_mean double precision, b_std double precision, b_n double precision, equal_var boolean, alternative character varying) RETURNS public.welchs_t_test_results
    LANGUAGE plpython3u IMMUTABLE
    AS $$
  import scipy.stats
  if a_mean is None or not a_std or not a_n or b_mean is None or not b_std or not b_n:
    return (None, None)
  result = scipy.stats.ttest_ind_from_stats(a_mean, a_std, a_n, b_mean, b_std, b_n, equal_var=equal_var, alternative=alternative)
  return (result.statistic, result.pvalue)
$$;


--
-- Name: welchs_t_test_vectorized(character varying[], double precision[], double precision[], double precision[], double precision[], double precision[], double precision[], boolean, character varying, double precision, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.welchs_t_test_vectorized(genes character varying[], a_mean double precision[], a_std double precision[], a_n double precision[], b_mean double precision[], b_std double precision[], b_n double precision[], ttest_equal_var boolean, ttest_alternative character varying, p_adjust_alpha double precision, p_adjust_method character varying) RETURNS public.welchs_t_test_vectorized_results[]
    LANGUAGE plpython3u IMMUTABLE
    AS $$
  import numpy as np
  import scipy.stats
  import statsmodels.stats.multitest

  n = len(genes)
  np_a_mean = np.array(a_mean, dtype=np.float64)
  np_a_std = np.array(a_std, dtype=np.float64)
  np_a_n = np.array(a_n, dtype=np.float64)
  np_b_mean = np.array(b_mean, dtype=np.float64)
  np_b_std = np.array(b_std, dtype=np.float64)
  np_b_n = np.array(b_n, dtype=np.float64)

  np_a_mean_is_zero = np.isclose(np_a_mean, 0.)
  np_b_mean_is_zero = np.isclose(np_b_mean, 0.)
  np_a_and_b_are_nonzero = ~np_a_mean_is_zero & ~np_b_mean_is_zero
  log2fc = np.zeros(n)
  log2fc[np_a_mean_is_zero & np_b_mean_is_zero] = 0.
  log2fc[np_a_mean_is_zero & ~np_b_mean_is_zero] = -np.inf
  log2fc[~np_a_mean_is_zero & np_b_mean_is_zero] = np.inf
  log2fc[np_a_and_b_are_nonzero] = (
    np.log2(np_a_mean[np_a_and_b_are_nonzero])
    - np.log2(np_b_mean[np_a_and_b_are_nonzero])
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
$$;


--
-- Name: data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.data_id_seq OWNED BY public.data.id;


--
-- Name: data_transcript_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.data_transcript_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_transcript_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.data_transcript_id_seq OWNED BY public.data_transcript.id;


--
-- Name: database_agg; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.database_agg AS
 SELECT data.id,
    data.database,
    data.gene,
    public.aggregate_stats(data."values") AS "values"
   FROM public.data
  WITH NO DATA;


--
-- Name: database_agg_transcript; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.database_agg_transcript AS
 SELECT data_transcript.id,
    data_transcript.database,
    data_transcript.transcript,
    public.aggregate_stats(data_transcript."values") AS "values"
   FROM public.data_transcript
  WITH NO DATA;


--
-- Name: database_dist; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.database_dist AS
 SELECT database_agg.database,
    public.agg_mean_std_count(jsonb_agg(database_agg."values")) AS dist
   FROM public.database_agg
  GROUP BY database_agg.database
  WITH NO DATA;


--
-- Name: gene_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gene_info (
    id integer NOT NULL,
    symbol character varying,
    synonyms jsonb,
    chromosome character varying,
    map_location character varying,
    description character varying,
    type_of_gene character varying,
    summary text
);


--
-- Name: gene_transcript; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gene_transcript (
    gene uuid NOT NULL,
    transcript uuid NOT NULL
);


--
-- Name: mapper; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.mapper AS
 SELECT gene.gene,
    transcript.transcript
   FROM ((public.gene_transcript
     LEFT JOIN public.gene ON ((gene_transcript.gene = gene.id)))
     LEFT JOIN public.transcript ON ((gene_transcript.transcript = transcript.id)));


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: unified_term_map; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unified_term_map (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    original_term character varying,
    term character varying
);


--
-- Name: data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data ALTER COLUMN id SET DEFAULT nextval('public.data_id_seq'::regclass);


--
-- Name: data_transcript id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_transcript ALTER COLUMN id SET DEFAULT nextval('public.data_transcript_id_seq'::regclass);


--
-- Name: data data_database_gene_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_database_gene_key UNIQUE (database, gene);


--
-- Name: data data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_pkey PRIMARY KEY (id);


--
-- Name: data_transcript data_transcript_database_transcript_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_transcript
    ADD CONSTRAINT data_transcript_database_transcript_key UNIQUE (database, transcript);


--
-- Name: data_transcript data_transcript_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_transcript
    ADD CONSTRAINT data_transcript_pkey PRIMARY KEY (id);


--
-- Name: database database_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.database
    ADD CONSTRAINT database_pkey PRIMARY KEY (id);


--
-- Name: gene_info gene_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_info
    ADD CONSTRAINT gene_info_pkey PRIMARY KEY (id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: gene_transcript gene_transcript_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_transcript
    ADD CONSTRAINT gene_transcript_pkey PRIMARY KEY (gene, transcript);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: transcript transcript_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcript
    ADD CONSTRAINT transcript_pkey PRIMARY KEY (id);


--
-- Name: unified_term_map unified_term_map_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unified_term_map
    ADD CONSTRAINT unified_term_map_pkey PRIMARY KEY (id);


--
-- Name: data_database_fkey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX data_database_fkey ON public.data USING btree (database);


--
-- Name: data_gene_fkey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX data_gene_fkey ON public.data USING btree (gene);


--
-- Name: database_agg_database_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX database_agg_database_idx ON public.database_agg USING btree (database);


--
-- Name: database_agg_trancript_database_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX database_agg_trancript_database_idx ON public.database_agg_transcript USING btree (database);


--
-- Name: database_agg_trancript_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX database_agg_trancript_id_idx ON public.database_agg_transcript USING btree (id);


--
-- Name: gene_gene_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gene_gene_idx ON public.gene USING btree (gene);


--
-- Name: gene_gene_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gene_gene_trgm_idx ON public.gene USING gin (gene public.gin_trgm_ops);


--
-- Name: gene_info_symbol_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gene_info_symbol_idx ON public.gene_info USING btree (symbol);


--
-- Name: unified_term_map_original_term_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_term_map_original_term_idx ON public.unified_term_map USING btree (original_term);


--
-- Name: data data_database_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_database_fkey FOREIGN KEY (database) REFERENCES public.database(id) ON DELETE CASCADE;


--
-- Name: data data_gene_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_gene_fkey FOREIGN KEY (gene) REFERENCES public.gene(id) ON DELETE CASCADE;


--
-- Name: data_transcript data_transcript_database_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_transcript
    ADD CONSTRAINT data_transcript_database_fkey FOREIGN KEY (database) REFERENCES public.database(id) ON DELETE CASCADE;


--
-- Name: data_transcript data_transcript_transcript_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_transcript
    ADD CONSTRAINT data_transcript_transcript_fkey FOREIGN KEY (transcript) REFERENCES public.transcript(id) ON DELETE CASCADE;


--
-- Name: gene_transcript gene_transcript_gene_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_transcript
    ADD CONSTRAINT gene_transcript_gene_fkey FOREIGN KEY (gene) REFERENCES public.gene(id) ON DELETE CASCADE;


--
-- Name: gene_transcript gene_transcript_transcript_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_transcript
    ADD CONSTRAINT gene_transcript_transcript_fkey FOREIGN KEY (transcript) REFERENCES public.transcript(id) ON DELETE CASCADE;


--
-- Name: postgraphile_watch_ddl; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER postgraphile_watch_ddl ON ddl_command_end
         WHEN TAG IN ('ALTER AGGREGATE', 'ALTER DOMAIN', 'ALTER EXTENSION', 'ALTER FOREIGN TABLE', 'ALTER FUNCTION', 'ALTER POLICY', 'ALTER SCHEMA', 'ALTER TABLE', 'ALTER TYPE', 'ALTER VIEW', 'COMMENT', 'CREATE AGGREGATE', 'CREATE DOMAIN', 'CREATE EXTENSION', 'CREATE FOREIGN TABLE', 'CREATE FUNCTION', 'CREATE INDEX', 'CREATE POLICY', 'CREATE RULE', 'CREATE SCHEMA', 'CREATE TABLE', 'CREATE TABLE AS', 'CREATE VIEW', 'DROP AGGREGATE', 'DROP DOMAIN', 'DROP EXTENSION', 'DROP FOREIGN TABLE', 'DROP FUNCTION', 'DROP INDEX', 'DROP OWNED', 'DROP POLICY', 'DROP RULE', 'DROP SCHEMA', 'DROP TABLE', 'DROP TYPE', 'DROP VIEW', 'GRANT', 'REVOKE', 'SELECT INTO')
   EXECUTE FUNCTION postgraphile_watch.notify_watchers_ddl();


--
-- Name: postgraphile_watch_drop; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER postgraphile_watch_drop ON sql_drop
   EXECUTE FUNCTION postgraphile_watch.notify_watchers_drop();


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20221123142705'),
    ('20221212153155'),
    ('20230117163145'),
    ('20230117191156'),
    ('20230221183030'),
    ('20230223214101'),
    ('20230313174842'),
    ('20230403155038'),
    ('20230406190001'),
    ('20230419203711'),
    ('20230419204219');
