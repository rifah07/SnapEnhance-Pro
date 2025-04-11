#!/bin/bash

echo "🚀 Starting SnapEnhance container..."

CID=$(docker run -d -p 8080:80 snapenhance)

echo ""
echo "✅ Container started!"
echo "🔗 Visit SnapEnhance at: http://localhost:8080"
echo "📦 Container ID: $CID"