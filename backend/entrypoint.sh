#!/bin/bash

# python -m app.migrations  # Uncomment when to add migrations

# Start Gunicorn with Uvicorn workers
exec gunicorn --bind 0.0.0.0:$PORT --workers 4 --worker-class uvicorn.workers.UvicornWorker app.main:app