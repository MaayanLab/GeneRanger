# Extract Transform Load

This ETL pipeline manages provisioning a postgres database for the app, a Makefile facilitates all relevant commands.

## Quick Start
```bash
# install necessary dependencies
pip3 install -r requirements.txt
# also ensure you have: curl, docker-compose (https://docs.docker.com/compose/), dbmate (https://github.com/amacneil/dbmate)

# provision a database from scratch, fetching anything that is required
make create-db ingest

# review database
make docker-pg-shell
```
