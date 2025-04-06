export interface GPUInfo {
  id: number;
  name: string;
  temperature: number;
  memory_total: number;
  memory_used: number;
  memory_free: number;
  utilization: number;
}

export interface CPUInfo {
  model: string;
  architecture: string;
  physical_cores: number;
  logical_cores: number;
  utilization: number;
  utilization_per_core: number[];
  frequencies: number[];
  temperature?: number;
}

export interface RAMInfo {
  total: number;
  used: number;
  free: number;
  utilization: number;
}

export interface DiskInfo {
  device: string;
  mountpoint: string;
  fstype: string;
  total: number;
  used: number;
  free: number;
  utilization: number;
}

export interface NetworkInterfaceInfo {
  name: string;
  ipv4?: string;
  ipv6?: string;
  mac?: string;
  bytes_sent: number;
  bytes_recv: number;
  packets_sent: number;
  packets_recv: number;
  errin: number;
  errout: number;
  dropin: number;
  dropout: number;
}

export interface DockerContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: Record<string, any>;
}

export interface PortInfo {
  local_ip: string;
  local_port: number;
  remote_ip?: string;
  remote_port?: number;
  status: string;
  pid?: number;
  process_name?: string;
  protocol: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  username: string;
  status: string;
  cpu_percent: number;
  memory_percent: number;
  created_time: number;
  cmdline: string[];
  num_threads: number;
  nice?: number;
}

export interface SystemInfo {
  cpu: CPUInfo;
  gpu: GPUInfo[];
  ram: RAMInfo;
  disk: DiskInfo[];
  interfaces: NetworkInterfaceInfo[];
  container: DockerContainerInfo[];
  ports: PortInfo[];
  processes: ProcessInfo[];
} 