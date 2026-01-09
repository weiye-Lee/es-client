# ES Client Docker Deployment

This guide explains how to build and run the ES Client application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Building and Running

1. Navigate to the deploy directory:
   ```bash
   cd deploy
   ```

2. Build and start the application:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Docker image using the Dockerfile
   - Start the container on port 8080

3. Access the application at `http://localhost:8080`

## Alternative Commands

- Run in detached mode:
  ```bash
  docker-compose up -d --build
  ```

- Stop the application:
  ```bash
  docker-compose down
  ```

- Rebuild after code changes:
  ```bash
  docker-compose up --build --force-recreate
  ```

## Configuration

- The application runs on port 8080 by default (configurable in docker-compose.yml)
- Nginx serves the static files
- The build process uses pnpm for dependency management

## Troubleshooting

- If you encounter build issues, ensure all dependencies are properly installed
- Check Docker logs: `docker-compose logs`
- Verify port 8080 is not in use by another service