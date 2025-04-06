# System Resource Monitor

A comprehensive system monitoring tool that provides real-time information about CPU, GPU, RAM, Disk, Network, and Docker containers.

## Features

- Real-time CPU monitoring (utilization, temperature, frequency)
- GPU monitoring (NVIDIA)
- RAM usage tracking
- Disk usage monitoring
- Network interface statistics
- Docker container monitoring
- Modern React frontend with Material UI

## Running as a Single Service

This application can run as a single service without Docker, serving both the frontend and backend from the same process.

### Prerequisites

- Python 3.8+ with pip
- Node.js 18+ and npm (for building the frontend)
- NVIDIA drivers (for GPU monitoring)
- Docker daemon (for container monitoring)

### Quick Start

1. Clone this repository:
   ```
   git clone <repository-url>
   cd system-resource-monitor
   ```

2. Make the startup script executable:
   ```
   chmod +x start.sh
   ```

3. Run the application:
   ```
   ./start.sh
   ```

4. Access the application in your browser:
   ```
   http://localhost:8000
   ```

### What Happens Under the Hood

The startup script:
1. Creates a Python virtual environment
2. Installs the required Python dependencies
3. Runs the environment check to verify system access
4. Builds the React frontend and copies it to the static directory
5. Starts a FastAPI server that serves both the API and static frontend files

### Manual Setup

If you prefer to set up and run the application manually:

1. Set up the Python environment:
   ```
   python3 -m venv venv
   source venv/bin/activate
   pip install -r Api/requirements.txt
   ```

2. Build the frontend:
   ```
   cd frontend
   npm install
   npm run build
   ```

3. Copy the frontend build to the API static directory:
   ```
   mkdir -p ../Api/static
   cp -r build/* ../Api/static/
   ```

4. Run the combined service:
   ```
   cd ../Api
   python serve.py
   ```

## Troubleshooting

### GPU Monitoring Issues
- Ensure NVIDIA drivers are installed and working
- Run `nvidia-smi` to verify GPU access
- The application will function without GPU monitoring if not available

### Docker Container Monitoring Issues
- Ensure Docker daemon is running: `systemctl status docker`
- Verify the user has permission to access the Docker socket
- The application will function without container monitoring if not available

## Architecture

- **Frontend**: React, Material UI, recharts for visualizations
- **Backend**: FastAPI, Python with psutil, pynvml, and docker SDK 