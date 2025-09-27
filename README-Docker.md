# 🐳 AI Data Agent - Docker Setup

This guide will help you run the AI Data Agent application using Docker containers.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (included with Docker Desktop)
- At least **4GB RAM** available for containers
- At least **2GB disk space** for models and data

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Run the setup script
docker-setup.bat
```

**Linux/Mac:**
```bash
# Make script executable and run
chmod +x docker-setup.sh
./docker-setup.sh
```

### Option 2: Manual Setup

1. **Clone and navigate to project:**
   ```bash
   git clone <your-repo>
   cd AI-Data-Agent
   ```

2. **Create necessary directories:**
   ```bash
   mkdir -p data logs ssl
   ```

3. **Build and start services:**
   ```bash
   docker-compose up --build -d
   ```

4. **Setup AI model:**
   ```bash
   docker-compose exec ollama ollama pull gemma2:2b
   ```

## 🏗️ Architecture

The Docker setup includes:

- **ai-data-agent**: Main application (Flask + React)
- **ollama**: AI model server
- **redis**: Caching layer
- **nginx**: Reverse proxy (optional)

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:8001 | Main web interface |
| **Ollama API** | http://localhost:11434 | AI model API |
| **Redis** | localhost:6379 | Cache database |
| **Nginx** | http://localhost:80 | Load balancer (if enabled) |

## 📊 Service Management

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-data-agent
docker-compose logs -f ollama
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart ai-data-agent
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Update Services
```bash
# Rebuild and restart
docker-compose up --build -d

# Update AI model
docker-compose exec ollama ollama pull gemma2:2b
```

## 🤖 AI Model Management

### Available Models
- **gemma2:2b** (default) - Fast, lightweight
- **gemma2:9b** - More capable, requires more RAM
- **llama3:8b** - Alternative option

### Switch Models
```bash
# Pull new model
docker-compose exec ollama ollama pull gemma2:9b

# Update environment variable in docker-compose.yml
# Change: OLLAMA_MODEL=gemma2:9b

# Restart application
docker-compose restart ai-data-agent
```

### GPU Support (Optional)
Uncomment the GPU deployment section in `docker-compose.yml`:
```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## 📁 Data Persistence

Data is persisted in Docker volumes:
- **ollama_data**: AI models and cache
- **redis_data**: Application cache
- **./data**: Application data (SQLite, uploaded files)
- **./logs**: Application logs

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` to modify:

```yaml
environment:
  - OLLAMA_BASE_URL=http://ollama:11434
  - OLLAMA_MODEL=gemma2:2b
  - FLASK_ENV=production
```

### Nginx Configuration

Edit `nginx.conf` for:
- Rate limiting
- SSL certificates
- Custom domains
- Load balancing

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :8001
   
   # Change ports in docker-compose.yml
   ```

2. **Out of memory:**
   ```bash
   # Check container memory usage
   docker stats
   
   # Increase Docker memory limit in settings
   ```

3. **Model download fails:**
   ```bash
   # Check Ollama logs
   docker-compose logs ollama
   
   # Retry model download
   docker-compose exec ollama ollama pull gemma2:2b
   ```

4. **Application won't start:**
   ```bash
   # Check application logs
   docker-compose logs ai-data-agent
   
   # Rebuild container
   docker-compose up --build --force-recreate ai-data-agent
   ```

### Health Checks

```bash
# Check if services are healthy
docker-compose ps

# Test application endpoint
curl http://localhost:8001/health

# Test Ollama endpoint
curl http://localhost:11434/api/tags
```

## 🔒 Security Considerations

- Change default ports in production
- Use SSL certificates for HTTPS
- Implement proper authentication
- Regular security updates
- Network isolation for production

## 📈 Performance Optimization

- Use SSD storage for better I/O
- Allocate sufficient RAM (8GB+ recommended)
- Enable GPU acceleration if available
- Use Redis for caching
- Implement connection pooling

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify system requirements
3. Try rebuilding: `docker-compose up --build -d`
4. Check Docker Desktop status
5. Review this documentation

## 📝 Development

For development with hot reloading:

```bash
# Run in development mode
docker-compose -f docker-compose.dev.yml up --build
```

Create `docker-compose.dev.yml` for development-specific overrides.
