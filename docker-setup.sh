#!/bin/bash

# AI Data Agent Docker Setup Script
echo "🚀 Setting up AI Data Agent with Docker..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs ssl

# Set permissions
chmod 755 data logs

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Pull and setup Ollama model
echo "🤖 Setting up Ollama model..."
docker-compose exec ollama ollama pull gemma2:2b

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your application at:"
echo "   - Application: http://localhost:8000"
echo "   - Ollama API: http://localhost:11434"
echo "   - Redis: localhost:6379"
echo ""
echo "📊 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Update model: docker-compose exec ollama ollama pull gemma2:2b"
echo ""
echo "🎉 Your AI Data Agent is ready to use!"
