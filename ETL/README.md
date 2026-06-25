# Extract Transform Load

This ETL pipeline manages provisioning a postgres database for the app, a Makefile facilitates all relevant commands.

## Quick Start
```bash
# make sure you have: python uv, curl, docker-compose (https://docs.docker.com/compose/), dbmate (https://github.com/amacneil/dbmate)
uv venv
source .venv/bin/activate

# install necessary dependencies
uv pip install -r requirements.txt

# provision a database from scratch, fetching anything that is required
make create-db ingest

# review database
make docker-pg-shell
```
