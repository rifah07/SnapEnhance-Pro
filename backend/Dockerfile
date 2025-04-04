FROM python:3.9-slim-buster

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/backend \
    PATH="/home/appuser/.local/bin:${PATH}" \
    PORT=8000 \
    UPLOAD_FOLDER=/backend/static/uploads \
    PROCESSED_FOLDER=/backend/static/processed

RUN mkdir -p /backend/static/{uploads,processed} && \
    chmod -R 755 /backend/static

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser && \
    chown -R appuser:appuser /backend

WORKDIR /backend
USER appuser

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir --no-warn-script-location -r requirements.txt

COPY --chown=appuser:appuser . .

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]