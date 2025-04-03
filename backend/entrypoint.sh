#!/bin/bash

# Wait for MongoDB to be ready (when using local MongoDB)
# while ! nc -z mongodb 27017; do
#   echo "Waiting for MongoDB..."
#   sleep 1
# done

echo "Starting application..."
exec gunicorn --bind 0.0.0.0:8000 app.main:app