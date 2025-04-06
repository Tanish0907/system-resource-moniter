import { useState, useEffect } from 'react';
import axios from 'axios';
import { SystemInfo, CPUInfo, RAMInfo, GPUInfo, DiskInfo, NetworkInterfaceInfo, DockerContainerInfo, PortInfo, ProcessInfo } from '../types';

// Using relative path since API and frontend are served from the same origin
// const API_URL = '';
// Fallback to the hardcoded IP only if needed for development
const API_URL = 'http://100.67.141.60:8000';

export const useSystemData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemData, setSystemData] = useState<SystemInfo | null>(null);
  const [cpuData, setCpuData] = useState<CPUInfo | null>(null);
  const [ramData, setRamData] = useState<RAMInfo | null>(null);
  const [gpuData, setGpuData] = useState<GPUInfo[]>([]);
  const [diskData, setDiskData] = useState<DiskInfo[]>([]);
  const [networkData, setNetworkData] = useState<NetworkInterfaceInfo[]>([]);
  const [containerData, setContainerData] = useState<DockerContainerInfo[]>([]);
  const [portData, setPortData] = useState<PortInfo[]>([]);
  const [processData, setProcessData] = useState<ProcessInfo[]>([]);

  const fetchAllData = async () => {
    try {
      setLoading(false);
      const response = await axios.get<SystemInfo>(`${API_URL}/api/sys`);
      setSystemData(response.data);
      setCpuData(response.data.cpu);
      setRamData(response.data.ram);
      setGpuData(response.data.gpu);
      setDiskData(response.data.disk);
      setNetworkData(response.data.interfaces);
      setContainerData(response.data.container);
      setPortData(response.data.ports || []);
      setProcessData(response.data.processes || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError('Failed to fetch system data. Please check if the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Set up polling to fetch data every 5 seconds
    const intervalId = setInterval(fetchAllData, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return {
    loading,
    error,
    systemData,
    cpuData,
    ramData,
    gpuData,
    diskData,
    networkData,
    containerData,
    portData,
    processData,
    refetch: fetchAllData
  };
}; 