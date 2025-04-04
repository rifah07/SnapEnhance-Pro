#!/bin/bash

# Wait for MongoDB if needed
# while ! nc -z $MONGO_HOST $MONGO_PORT; do sleep 1; done

# Apply migrations
# python -m app.migrate

# Start server
exec gunicorn --bind 0.0.0.0:$PORT \
              --workers 4 \
              --worker-class uvicorn.workers.UvicornWorker \
              --access-logfile - \
              --error-logfile - \
              app.main:app