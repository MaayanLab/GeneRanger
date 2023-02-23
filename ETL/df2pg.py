''' https://gist.github.com/u8sand/44d39f35c779192f4a34bf5279356ae3
This snippet can be used for quickly copying a pandas dataframe
 into postgres via unix pipe. I expect this to be faster than other
 approaches since the writing can happen entirely in native code:
 - os.pipe is facilitated by the kernel
 - psycopg2 copy_from uses libpg
 - np.savetxt uses libnumpy
Usage:
```python
import psycopg2
import pandas as pd
import numpy as np
# or just paste the functions here
from df2pg import copy_from_df
# some random postgres connection
con = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/postgres')
# some random schema
cur = con.cursor()
cur.execute("""
create table "data" (
  "x" decimal,
  "y" decimal,
  "z" decimal
);
""")
con.commit()
# some random dataframe
df = pd.DataFrame(np.random.normal(size=(1000000, 3)), columns=['x', 'y', 'z'], copy=False)
# actually copy the data
copy_from_df(con, 'data', df)
# verify it worked
cur = con.cursor()
cur.execute('select * from data limit 5')
cur.fetchall()
df.head()
'''
import json
import typing as t
import pandas as pd
import psycopg2

FileDescriptor = t.Union[int, str]

def pgrepr(value, column=False):
  ''' Sanitize a value for a pg statement
  '''
  if type(value) == str:
    if column:
      return f'''"{value}"'''
    else:
      return f"""'{value.replace("'", "''")}'"""
  elif type(value) in {int, float, bool, dict}:
    return json.dumps(value)
  else:
    raise NotImplementedError(type(value))

def copy_from_tsv(con: 'psycopg2.connection', table: str, columns: 'list[str]', r: FileDescriptor):
  ''' Copy from a file descriptor into a postgres database table through as psycopg2 connection object
  :param con: The psycopg2.connect object
  :param r: An file descriptor to be opened in read mode
  :param table: The table top copy into
  :param columns: The columns being copied
  '''
  import os
  with con.cursor() as cur:
    with os.fdopen(r, 'rb', buffering=0, closefd=True) as fr:
      columns = fr.readline().strip().split(b'\t')
      cur.copy_expert(
        sql=f'''
        COPY {pgrepr(table, True)} ({",".join(pgrepr(c.decode(), True) for c in columns)})
        FROM STDIN WITH CSV DELIMITER E'\\t'
        ''',
        file=fr,
      )
    con.commit()

def copy_from_df(con: 'psycopg2.connection', table: str, df: pd.DataFrame, float_format: str = '%g', native: bool = True):
  ''' Copy from a pandas dataframe into a postgres database table through as psycopg2 connection object.
  This is done by constructing a unix pipe, writing the data frame
   into the pipe while loading from the pipe into postgres at the same time.
  :param con: The psycopg2.connect object
  :param table: The table to write the pandas dataframe into
  :param df: The pandas dataframe to write to the database
  :param native: Use native write, this should be preferred as it performs writes
                 with numpy (in C), but it might be worse if you have python
                 objects in your data frame.
  '''
  import os, numpy as np, threading
  r, w = os.pipe()
  # we copy_from_tsv with the read end of this pipe in
  #  another thread
  rt = threading.Thread(
    target=copy_from_tsv,
    args=(con, table, df.columns, r,),
  )
  rt.start()
  try:
    # we write to the write end of this pipe in this thread
    with os.fdopen(w, 'wb', buffering=0, closefd=True) as fw:
      if native:
        # np.savetxt is typically faster than pd.to_csv as more
        #  of it seems to be implemented in native code
        np.savetxt(
          fw, df.values,
          fmt=float_format,
          delimiter='\t',
          newline='\n',
          comments='',
          header='\t'.join(df.columns.tolist()),
        )
      else:
        # pandas to_csv is probably more compatible with a wider
        #  range of data types but is slower
        df.to_csv(
          fw,
          float_format=float_format,
          sep='\t',
          index=None,
        )
  finally:
    # we wait for the copy_from_tsv thread to finish
    rt.join()

def copy_from_records(con: 'psycopg2.connection', table: str, columns: 'list[str]', records: t.Iterable[dict], chunk_size: int = 1000, migration=None):
  ''' Copy from records into a postgres database table through as psycopg2 connection object.
  This is done by constructing a unix pipe, writing the records with csv writer
   into the pipe while loading from the pipe into postgres at the same time.
  :param con: The psycopg2.connect object
  :param table: The table to write the pandas dataframe into
  :param columns: The columns being written into the table
  :param records: An iterable of records to write
  :param migration: An optional file to store the insertions for applying to another db
  '''
  import os, csv, more_itertools as mit, threading
  for chunked_records in mit.ichunked(records, chunk_size):
    r, w = os.pipe()
    # we copy_from_tsv with the read end of this pipe in
    #  another thread
    rt = threading.Thread(
      target=copy_from_tsv,
      args=(con, table, columns, r,),
    )
    rt.start()
    try:
      # we write to the write end of this pipe in this thread
      with os.fdopen(w, 'w', closefd=True) as fw:
        writer = csv.DictWriter(fw, fieldnames=columns, delimiter='\t')
        writer.writeheader()
        if migration:
          chunked_records = list(chunked_records)
          print(
            'insert','into', pgrepr(table, True), '(', ','.join(pgrepr(c, True) for c in columns), ')',
            'values',
            ','.join(
              '(' + ','.join(pgrepr(record[col]) for col in columns) + ')'
              for record in chunked_records
            ),
            ';',
            file=migration,
          )
        writer.writerows(chunked_records)
    finally:
      # we wait for the copy_from_tsv thread to finish
      rt.join()
