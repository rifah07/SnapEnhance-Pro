#!/bin/bash
# Wait for dependencies if needed
# while ! nc -z $MONGO_HOST $MONGO_PORT; do sleep 1; done

# Start Gunicorn with production settings
exec gunicorn --bind 0.0.0.0:$PORT \
              --workers 4 \
              --worker-class uvicorn.workers.UvicornWorker \
              --access-logfile - \
              --error-logfile - \
              app.main:app