# System Resource Monitor

A comprehensive system monitoring tool that provides real-time information about CPU, GPU, RAM, Disk, Network, Docker containers, Processes, and Open Ports.

## Features

- **CPU Monitoring**: Real-time utilization, temperature, frequencies per core
- **GPU Monitoring**: NVIDIA GPU temperature, memory usage, and utilization
- **RAM Usage**: Total, used, free memory and utilization percentage
- **Disk Monitoring**: Usage statistics for all mounted filesystems
- **Network Interfaces**: Statistics for all network interfaces including throughput
- **Process Monitoring**: All running processes with user, CPU/memory usage, and status
- **Open Ports**: TCP/UDP ports in use across all network interfaces
- **Docker Containers**: Running containers with status and port mapping
- **Modern UI**: React frontend with Material UI components and real-time updates

## Running as a Single Service

This application can run as a single service without Docker, serving both the frontend and backend from the same process.

### Prerequisites

- Python 3.8+ with pip
- Node.js 18+ and npm (for building the frontend)
- NVIDIA drivers (for GPU monitoring, optional)
- Docker daemon (for container monitoring, optional)

### Quick Start

1. Clone this repository:
   ```
   git clone <repository-url>
   cd system-resource-monitor
   ```

2. Make the startup script executable:
   ```
   chmod +x serve.sh
   ```

3. Run the application:
   ```
   ./serve.sh
   ```

4. Access the application in your browser:
   ```
   http://localhost:3000
   ```

### Features in Detail

#### Process Monitoring
- View all running processes and services
- Filter processes by name, user, PID, or command line
- Sort by CPU usage, memory usage, or PID
- See detailed information including:
  - Process status with visual indicators
  - CPU and memory consumption percentages
  - User running each process
  - Process creation time
  - Number of threads
  - Full command line arguments (via tooltip)

#### Open Ports Monitoring
- See all open TCP and UDP ports on all interfaces
- Information includes:
  - Protocol (TCP/UDP)
  - Local and remote IP/port
  - Connection status
  - Associated process name and PID

#### Docker Container Monitoring
- View all running Docker containers
- See container status, image name, and port mappings
- Track container resource usage

### Architecture

- **Frontend**: React with TypeScript, Material UI, recharts for visualizations
- **Backend**: FastAPI (Python) with:
  - psutil for system metrics
  - pynvml for NVIDIA GPU metrics
  - docker-py for container monitoring

### Troubleshooting

#### Process Monitoring Issues
- Some process information may be limited due to permission issues
- Run with elevated permissions to see all process details
- The process list is automatically sorted by memory usage (can be changed in the UI)

#### Port Monitoring Issues
- May require elevated permissions to see all ports
- Some special ports might not appear due to system restrictions

#### GPU Monitoring Issues
- Requires NVIDIA drivers to be installed and working
- Run `nvidia-smi` to verify GPU access
- The application will function without GPU monitoring if not available

#### Docker Container Monitoring Issues
- Requires Docker daemon to be running
- Verify user has permission to access the Docker socket
- The application will function without container monitoring if not available

## Security Considerations

The system resource monitor needs various system permissions to operate fully:

- Reading process information (may be restricted by user permissions)
- Reading network socket information for port monitoring
- Access to the Docker socket for container monitoring
- Access to GPU devices for monitoring
- Access to system sensors for temperature readings

For full functionality, consider running the application with appropriate permissions. 