# System Resource Monitor

A React-based dashboard that displays system resources using real-time data from a FastAPI backend, including:
- CPU utilization and frequency information
- RAM usage
- GPU details (if available)
- Disk usage
- Network interface statistics
- Docker container information
- Service URLs for exposed container ports (with Tailscale integration)

## Features

- Real-time monitoring of system resources
- Interactive charts using Recharts
- Clean, responsive UI
- Tab-based navigation between different resource views
- Automatic data refresh every 5 seconds
- Quick access links to services running in Docker containers
- Tailscale network interface detection for remote access to container services

## Requirements

- Node.js (>= 14.x)
- npm (>= 6.x)
- FastAPI backend running (included in the repository)
- Tailscale (optional, for remote access to container services)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Make sure the FastAPI backend is running at http://localhost:8000 (or update the API_URL in src/hooks/useSystemData.ts if using a different URL)

## Backend API

The application relies on a FastAPI backend that provides system resource information via several endpoints:

- `/cpu` - CPU information
- `/ram` - RAM usage data
- `/gpus` - GPU information (if available)
- `/disks` - Storage information
- `/network` - Network interface statistics
- `/containers` - Docker container information
- `/sys` - Combined data from all endpoints

## Container Service URLs with Tailscale Integration

The application automatically detects and displays accessible URLs for services running in Docker containers. It includes special integration with Tailscale:

1. The system automatically detects Tailscale network interfaces
2. When generating URLs for container services, it prioritizes using the Tailscale IPv4 address
3. This allows remote access to your services through the Tailscale network from any device

If Tailscale is not detected, the system will fall back to using localhost or the container's configured host IP address.

### How it works:

1. Extracts port mappings from the Docker container information
2. Detects any network interface with "tailscale" or "ts" in the name
3. Uses the Tailscale IPv4 address for service URLs when available
4. Generates clickable URLs with appropriate protocols based on port configuration
5. Attempts to detect the service type based on the container image name
6. Displays everything in an easy-to-use table with direct links

This makes it easy to access web applications, databases, and other services running in your Docker containers from any device connected to your Tailscale network.

## Technologies Used

- React
- TypeScript
- Recharts (for data visualization)
- Axios (for API calls)
- FastAPI (backend)

## License

MIT
