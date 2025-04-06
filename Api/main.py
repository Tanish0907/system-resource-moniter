from fastapi import FastAPI
from pydantic import BaseModel
from pynvml import *
import psutil
import docker
import platform
from cpuinfo import get_cpu_info
from typing import List, Optional, Dict
import socket
import pwd
import os
import time
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now; can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize NVIDIA Management Library with error handling
try:
    nvmlInit()
    device_count = nvmlDeviceGetCount()
    nvidia_available = True
except Exception as e:
    print(f"NVIDIA GPU initialization error: {str(e)}")
    nvidia_available = False
    device_count = 0

class NetworkInterfaceInfo(BaseModel):
    name: str
    ipv4: Optional[str]
    ipv6: Optional[str]
    mac: Optional[str]
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    errin: int
    errout: int
    dropin: int
    dropout: int


class DockerContainerInfo(BaseModel):
    id: str
    name: str
    image: str
    status: str
    ports: dict

class GPUInfo(BaseModel):
    id: int
    name: str
    temperature: int
    memory_total: int
    memory_used: int
    memory_free: int
    utilization: int


class CPUInfo(BaseModel):
    model: str
    architecture: str
    physical_cores: int
    logical_cores: int
    utilization: float
    utilization_per_core: List[float]
    frequencies: List[float]
    temperature: Optional[float]
 # Not all systems support this

class RAMInfo(BaseModel):
    total: int
    used: int
    free: int
    utilization: float

class DiskInfo(BaseModel):
    device: str
    mountpoint: str
    fstype: str
    total: int
    used: int
    free: int
    utilization: float

class PortInfo(BaseModel):
    local_ip: str
    local_port: int
    remote_ip: Optional[str]
    remote_port: Optional[int]
    status: str
    pid: Optional[int]
    process_name: Optional[str]
    protocol: str

class ProcessInfo(BaseModel):
    pid: int
    name: str
    username: str
    status: str
    cpu_percent: float
    memory_percent: float
    created_time: float
    cmdline: List[str]
    num_threads: int
    nice: Optional[int]

@app.get("/api")
def test():
    return({"api":"running"})

@app.get("/api/gpus", response_model=list[GPUInfo])
def get_gpus():
    if not nvidia_available:
        return []
        
    gpus = []
    try:
        for i in range(device_count):
            try:
                handle = nvmlDeviceGetHandleByIndex(i)
                mem_info = nvmlDeviceGetMemoryInfo(handle)
                utilization = nvmlDeviceGetUtilizationRates(handle)
                temperature = nvmlDeviceGetTemperature(handle, NVML_TEMPERATURE_GPU)
                name = nvmlDeviceGetName(handle).encode('utf-8')

                gpu_data = GPUInfo(
                    id=i,
                    name=name,
                    temperature=temperature,
                    memory_total=mem_info.total // 1024**2,
                    memory_used=mem_info.used // 1024**2,
                    memory_free=mem_info.free // 1024**2,
                    utilization=utilization.gpu
                )
                gpus.append(gpu_data)
            except Exception as e:
                print(f"Error getting info for GPU {i}: {str(e)}")
        return gpus
    except Exception as e:
        print(f"Error accessing GPUs: {str(e)}")
        return []

# ---------------------- CPU Endpoint ----------------------
@app.get("/api/cpu", response_model=CPUInfo)
def get_cpu():
    import platform
    from cpuinfo import get_cpu_info

    cpu_info = get_cpu_info()
    freqs = psutil.cpu_freq(percpu=True)
    temps = psutil.sensors_temperatures()

    # Try to get CPU temperature (if supported)
    cpu_temp = None
    for name, entries in temps.items():
        for entry in entries:
            if "core" in entry.label.lower() or "cpu" in entry.label.lower():
                cpu_temp = entry.current
                break
        if cpu_temp is not None:
            break

    return CPUInfo(
        model=cpu_info.get("brand_raw", "Unknown"),
        architecture=platform.machine(),
        physical_cores=psutil.cpu_count(logical=False),
        logical_cores=psutil.cpu_count(logical=True),
        utilization=psutil.cpu_percent(interval=1),
        utilization_per_core=psutil.cpu_percent(percpu=True),
        frequencies=[round(f.current, 2) for f in freqs],
        temperature=cpu_temp
    )


# ---------------------- RAM Endpoint ----------------------

@app.get("/api/ram", response_model=RAMInfo)
def get_ram():
    mem = psutil.virtual_memory()
    return RAMInfo(
        total=mem.total // 1024**2,
        used=mem.used // 1024**2,
        free=mem.available // 1024**2,
        utilization=mem.percent
    )

# ---------------------- Disk Endpoint ----------------------

@app.get("/api/disks", response_model=list[DiskInfo])
def get_disks():
    disks = []
    for part in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(part.mountpoint)
            disks.append(DiskInfo(
                device=part.device,
                mountpoint=part.mountpoint,
                fstype=part.fstype,
                total=usage.total // 1024**3,
                used=usage.used // 1024**3,
                free=usage.free // 1024**3,
                utilization=usage.percent
            ))
        except PermissionError:
            # Skip partitions that can't be accessed (like CD-ROM drives or protected mounts)
            continue
    return disks

@app.get("/api/containers", response_model=list[DockerContainerInfo])
def list_docker_containers():
    try:
        client = docker.from_env()
        containers = client.containers.list()
        container_info = []

        for c in containers:
            container_info.append(DockerContainerInfo(
                id=c.id[:12],
                name=c.name,
                image=c.image.tags[0] if c.image.tags else "untagged",
                status=c.status,
                ports=c.attrs['NetworkSettings']['Ports']
            ))

        return container_info
    except Exception as e:
        print(f"Error connecting to Docker: {str(e)}")
        return []

@app.get("/api/network", response_model=list[NetworkInterfaceInfo])
def get_network_interfaces():
    net_stats = psutil.net_io_counters(pernic=True)
    net_addrs = psutil.net_if_addrs()
    interfaces = []

    for iface_name, stats in net_stats.items():
        ipv4 = None
        ipv6 = None
        mac = None

        for addr in net_addrs.get(iface_name, []):
            if addr.family == socket.AF_INET:
                ipv4 = addr.address
            elif addr.family == socket.AF_INET6:
                ipv6 = addr.address
            elif addr.family == psutil.AF_LINK:
                mac = addr.address

        interfaces.append(NetworkInterfaceInfo(
            name=iface_name,
            ipv4=ipv4,
            ipv6=ipv6,
            mac=mac,
            bytes_sent=stats.bytes_sent,
            bytes_recv=stats.bytes_recv,
            packets_sent=stats.packets_sent,
            packets_recv=stats.packets_recv,
            errin=stats.errin,
            errout=stats.errout,
            dropin=stats.dropin,
            dropout=stats.dropout
        ))

    return interfaces

@app.get("/api/ports", response_model=List[PortInfo])
def get_open_ports():
    """Get all open ports on all network interfaces"""
    open_ports = []
    
    # Get TCP connections
    tcp_connections = psutil.net_connections(kind='tcp')
    for conn in tcp_connections:
        if conn.status != 'NONE' and conn.laddr:
            process_name = None
            if conn.pid:
                try:
                    process = psutil.Process(conn.pid)
                    process_name = process.name()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            port_info = PortInfo(
                local_ip=conn.laddr.ip,
                local_port=conn.laddr.port,
                remote_ip=conn.raddr.ip if conn.raddr else None,
                remote_port=conn.raddr.port if conn.raddr else None,
                status=conn.status,
                pid=conn.pid,
                process_name=process_name,
                protocol='TCP'
            )
            open_ports.append(port_info)
    
    # Get UDP connections
    udp_connections = psutil.net_connections(kind='udp')
    for conn in udp_connections:
        if conn.laddr:
            process_name = None
            if conn.pid:
                try:
                    process = psutil.Process(conn.pid)
                    process_name = process.name()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            port_info = PortInfo(
                local_ip=conn.laddr.ip,
                local_port=conn.laddr.port,
                remote_ip=conn.raddr.ip if conn.raddr else None,
                remote_port=conn.raddr.port if conn.raddr else None,
                status=conn.status,
                pid=conn.pid,
                process_name=process_name,
                protocol='UDP'
            )
            open_ports.append(port_info)
    
    return open_ports

@app.get("/api/processes", response_model=List[ProcessInfo])
def get_running_processes():
    """Get all running processes and services with their PIDs and users"""
    processes = []
    
    for proc in psutil.process_iter(['pid', 'name', 'username', 'status', 'cpu_percent', 
                                     'memory_percent', 'create_time', 'cmdline', 'num_threads', 'nice']):
        try:
            # Get process info
            proc_info = proc.info
            
            # Get username
            try:
                username = proc_info['username']
                # If username is None (can happen on some systems), try to get it from UID
                if username is None and hasattr(proc, 'uids'):
                    try:
                        username = pwd.getpwuid(proc.uids().real).pw_name
                    except (KeyError, AttributeError):
                        username = str(proc.uids().real) if hasattr(proc, 'uids') else "unknown"
            except (psutil.AccessDenied, psutil.ZombieProcess):
                username = "unknown"
            
            # Create process object
            process = ProcessInfo(
                pid=proc_info['pid'],
                name=proc_info['name'],
                username=username,
                status=proc_info['status'],
                cpu_percent=proc_info['cpu_percent'] or 0.0,
                memory_percent=proc_info['memory_percent'] or 0.0,
                created_time=proc_info['create_time'],
                cmdline=proc_info['cmdline'] or [],
                num_threads=proc_info['num_threads'] or 0,
                nice=proc_info['nice']
            )
            
            processes.append(process)
            
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    # Sort processes by memory usage (descending)
    processes.sort(key=lambda x: x.memory_percent, reverse=True)
    
    return processes

@app.get("/api/sys")
def get_all():
    cpu = get_cpu()
    gpu = []
    ram = get_ram()
    disk = get_disks()
    network = get_network_interfaces()
    containers = []
    ports = []
    processes = []
    
    # Try to get GPU info, but don't fail if it's not available
    try:
        gpu = get_gpus()
    except Exception as e:
        print(f"Error getting GPU info: {str(e)}")
    
    # Try to get container info, but don't fail if it's not available
    try:
        containers = list_docker_containers()
    except Exception as e:
        print(f"Error getting container info: {str(e)}")
    
    # Try to get open ports info, but don't fail if it's not available
    try:
        ports = get_open_ports()
    except Exception as e:
        print(f"Error getting ports info: {str(e)}")
    
    # Try to get processes info, but don't fail if it's not available
    try:
        processes = get_running_processes()
    except Exception as e:
        print(f"Error getting processes info: {str(e)}")
    
    return {
        "cpu": cpu,
        "gpu": gpu,
        "ram": ram,
        "disk": disk,
        "interfaces": network,
        "container": containers,
        "ports": ports,
        "processes": processes
    }

@app.on_event("shutdown")
def shutdown_event():
    nvmlShutdown()
