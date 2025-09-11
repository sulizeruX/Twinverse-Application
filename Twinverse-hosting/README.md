# Twinverse Hosting

This folder contains configurations for deploying the Twinverse application in a production environment using Docker Compose.

## Features

- All Twinverse services (frontend, APIs, WhatsApp server)
- Volume mounts for persistent data (WhatsApp session, logs)
- Health checks for all services
- Environment variable configuration
- Automatic container restart

## Quick Start

1. Make sure Docker and Docker Compose are installed on your server

2. Create the actual .env file:
   ```bash
   cp .env.sample .env
   ```

3. Edit the .env file with your specific configuration:
   ```bash
   nano .env
   ```
   - Add your GEMINI_API_KEY 
   - Update HOST_ADDRESS if deploying to a domain

4. Start the services:
   ```bash
   docker-compose up -d
   ```

5. Check if all services are running:
   ```bash
   docker-compose ps
   ```

## Accessing the services

- Frontend Dashboard: http://localhost:3000
- Backend API: http://localhost:9000
- Simulated API: http://localhost:8007
- Movable API: http://localhost:8000
- Inventory API: http://localhost:8002
- WhatsApp Server: http://localhost:3001

Replace 'localhost' with your server IP or domain name when accessed remotely.

## Managing the deployment

- View logs for all services:
  ```bash
  docker-compose logs
  ```

- View logs for a specific service:
  ```bash
  docker-compose logs backend-api
  ```

- Update to the latest version:
  ```bash
  docker-compose pull
  docker-compose up -d
  ```

- Stop all services:
  ```bash
  docker-compose down
  ```

- Stop and remove volumes (caution - this will delete all data):
  ```bash
  docker-compose down -v
  ```

## Volume Locations

Persistent data is stored in Docker volumes:
- `whatsapp_data`: WhatsApp session information
- `api_logs`: Backend API logs

## Backup

For backup of your configuration and persistent data, consider:
```bash
# Back up the .env file
cp .env .env.backup.$(date +%Y%m%d)

# You can use docker's volume backup mechanism if needed
docker run --rm -v twinverse-hosting_whatsapp_data:/data -v $(pwd):/backup alpine tar czf /backup/whatsapp-data-backup.tar.gz /data
```

## Troubleshooting

If a service isn't starting properly, check its logs:
```bash
docker-compose logs --tail=100 service-name
```

## Security Notes

- Change all default passwords in the .env file
- Never commit .env to version control
- Consider using a reverse proxy (like Nginx) with HTTPS for production