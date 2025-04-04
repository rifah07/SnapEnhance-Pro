FROM python:3.9-slim-buster

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/backend \
    PATH="/home/appuser/.local/bin:${PATH}" \
    PORT=8000

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser && \
    mkdir -p /backend/static && \
    chown -R appuser:appuser /backend

WORKDIR /backend
USER appuser

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir --no-warn-script-location -r requirements.txt

COPY --chown=appuser:appuser . .

RUN chmod +x entrypoint.sh

EXPOSE $PORT

ENTRYPOINT ["./entrypoint.sh"]