#!/bin/bash

# Exit on any error
set -e

# Start FastAPI backend
echo "Starting FastAPI backend..."
cd /home/home/Documents/sys_resource_moniter_docker_ubuntu/Api
source ~/anaconda3/etc/profile.d/conda.sh  # Ensures conda command is available 
conda activate ubunturm
nohup uvicorn main:app --host 100.67.141.60 --port 8000 > backend.log 2>&1 &

# Start React frontend
echo "Starting frontend..."
cd /home/home/Documents/sys_resource_moniter_docker_ubuntu/frontend
nohup serve -s build > frontend.log 2>&1 &
