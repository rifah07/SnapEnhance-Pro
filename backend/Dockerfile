FROM python:3.9-slim

WORKDIR /backend

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /backend/static/uploads /backend/static/processed && \
    chmod -R 755 /backend/static

ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    PYTHONPATH=/backend

EXPOSE $PORT

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]