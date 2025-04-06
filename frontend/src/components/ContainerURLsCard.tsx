import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DockerContainerInfo, NetworkInterfaceInfo } from '../types';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Chip,
  SelectChangeEvent,
  Box,
  Alert
} from '@mui/material';

// Use relative path for API when frontend and backend are served together
// or fallback to the hardcoded IP for development
const API_URL = '';
// const API_URL = 'http://100.67.141.60:8000';

interface ContainerURLsCardProps {
  containerData: DockerContainerInfo[];
  networkData: NetworkInterfaceInfo[];
  loading: boolean;
}

interface ServiceURL {
  containerName: string;
  containerImage: string;
  url: string;
  description: string;
  port: string;
  hasHtmlResponse?: boolean;
  isSuccess?: boolean;
  status?: string;
  statusCode?: number;
  checkingResponse?: boolean;
}

const ContainerURLsCard: React.FC<ContainerURLsCardProps> = ({ containerData, networkData, loading }) => {
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [tailscaleIp, setTailscaleIp] = useState<string | null>(null);
  const [serviceURLs, setServiceURLs] = useState<ServiceURL[]>([]);
  const [checkingUrls, setCheckingUrls] = useState<boolean>(false);
  const [urlsChecked, setUrlsChecked] = useState<boolean>(false);
  const [containerHash, setContainerHash] = useState<string>('');

  // Create a hash of container data to detect changes
  useEffect(() => {
    if (containerData.length > 0) {
      // Create a simple hash based on container IDs, names and ports
      const hash = containerData.map(c => 
        `${c.id}-${c.name}-${JSON.stringify(c.ports)}`
      ).join('|');
      setContainerHash(hash);
    }
  }, [containerData]);

  // Find Tailscale interface on component mount
  useEffect(() => {
    if (networkData && networkData.length > 0) {
      // Look for interface names that might be Tailscale
      const tailscaleInterface = networkData.find(
        iface => 
          iface.name.toLowerCase().includes('tailscale') || 
          iface.name.toLowerCase().includes('ts') ||
          iface.name.toLowerCase().includes('tun')
      );

      if (tailscaleInterface && tailscaleInterface.ipv4) {
        setTailscaleIp(tailscaleInterface.ipv4);
        // Set this as the default interface if not already selected
        if (!selectedInterface) {
          setSelectedInterface(tailscaleInterface.ipv4);
        }
      } else {
        // If no Tailscale interface found, default to localhost
        if (!selectedInterface) {
          setSelectedInterface('localhost');
        }
      }
    }
  }, [networkData]);

  const handleInterfaceChange = (event: SelectChangeEvent) => {
    setSelectedInterface(event.target.value);
    // Reset URL check status when interface changes
    setUrlsChecked(false);
  };

  // Generate all available interface options
  const getInterfaceOptions = useCallback(() => {
    const options = [
      { label: 'localhost', value: 'localhost' }
    ];
    
    // Add all network interfaces with IPv4
    if (networkData && networkData.length > 0) {
      networkData.forEach(iface => {
        if (iface.ipv4) {
          const isTailscale = iface.name.toLowerCase().includes('tailscale') || 
                              iface.name.toLowerCase().includes('ts') ||
                              iface.name.toLowerCase().includes('tun');
          
          options.push({
            label: `${iface.name} (${iface.ipv4})${isTailscale ? ' - Tailscale' : ''}`,
            value: iface.ipv4
          });
        }
      });
    }
    
    return options;
  }, [networkData]);

  // Generate URLs from container data - only when containers change
  useEffect(() => {
    if (!containerData || containerData.length === 0 || !selectedInterface || containerHash === '') {
      return;
    }

    // Extract service URLs from container port mappings
    const tempServiceURLs: ServiceURL[] = [];
    const seenPorts = new Set<string>();
    
    containerData.forEach(container => {
      if (!container.ports || Object.keys(container.ports).length === 0) {
        return;
      }
      
      Object.entries(container.ports).forEach(([containerPort, hostBinding]) => {
        if (!hostBinding) return;
        
        const bindings = Array.isArray(hostBinding) ? hostBinding : [hostBinding];
        
        bindings.forEach((binding: any) => {
          if (binding && binding.HostPort) {
            // Check if we've already seen this port
            const port = binding.HostPort;
            if (seenPorts.has(port)) {
              return; // Skip this port as we've already processed it
            }
            
            // Add this port to our tracking set
            seenPorts.add(port);
            
            const protocol = containerPort.includes('tcp') ? 'http' : 'https';
            
            // Try to determine service type from image name or container name
            const imageName = container.image.toLowerCase();
            let description = 'Service';
            
            if (imageName.includes('nginx')) description = 'Nginx Web Server';
            else if (imageName.includes('apache')) description = 'Apache Web Server';
            else if (imageName.includes('httpd')) description = 'HTTP Server';
            else if (imageName.includes('node')) description = 'Node.js Application';
            else if (imageName.includes('mongo')) description = 'MongoDB Database';
            else if (imageName.includes('mysql')) description = 'MySQL Database';
            else if (imageName.includes('postgres')) description = 'PostgreSQL Database';
            else if (imageName.includes('redis')) description = 'Redis Database';
            else if (imageName.includes('python')) description = 'Python Application';
            else if (imageName.includes('fastapi')) description = 'FastAPI Application';
            else if (imageName.includes('django')) description = 'Django Application';
            else if (imageName.includes('flask')) description = 'Flask Application';
            
            tempServiceURLs.push({
              containerName: container.name,
              containerImage: container.image,
              url: `${protocol}://${selectedInterface}:${port}`,
              description,
              port,
              checkingResponse: false,
              hasHtmlResponse: undefined,
              isSuccess: undefined,
              status: 'pending',
              statusCode: undefined
            });
          }
        });
      });
    });

    // Deduplicate URLs based on port
    const uniquePortMap = new Map<string, ServiceURL>();
    tempServiceURLs.forEach(service => {
      uniquePortMap.set(service.port, service);
    });
    
    // Convert back to array for display
    const uniqueServiceURLs = Array.from(uniquePortMap.values());
    setServiceURLs(uniqueServiceURLs);
    // Reset URL check status
    setUrlsChecked(false);
  }, [containerHash, selectedInterface]);

  // Check URL responses - but only when needed (new containers or interface change)
  useEffect(() => {
    // Only check URLs if they haven't been checked yet for this container set/interface
    if (serviceURLs.length === 0 || urlsChecked) {
      return;
    }

    const checkUrlResponses = async () => {
      setCheckingUrls(true);
      const updatedUrls = [...serviceURLs];
      
      // Use Promise.all to check all URLs in parallel for better performance
      const checkPromises = updatedUrls.map(async (service, index) => {
        service.checkingResponse = true;
        
        try {
          // Use the backend API to check the URL instead of direct requests
          const response = await axios.post(`${API_URL}/api/check-url`, {
            url: service.url
          });
          
          const result = response.data;
          
          updatedUrls[index] = {
            ...service,
            hasHtmlResponse: result.is_html,
            isSuccess: result.is_success,
            statusCode: result.status_code,
            status: result.error ? 'error' : 'success',
            checkingResponse: false
          };
        } catch (error) {
          updatedUrls[index] = {
            ...service,
            hasHtmlResponse: false,
            isSuccess: false,
            status: 'error',
            checkingResponse: false
          };
          console.error('Error checking URL:', service.url, error);
        }
      });
      
      try {
        await Promise.all(checkPromises);
        setServiceURLs(updatedUrls);
        // Mark URLs as checked so we don't repeatedly check them
        setUrlsChecked(true);
      } catch (error) {
        console.error('Error checking URLs:', error);
      } finally {
        setCheckingUrls(false);
      }
    };
    
    checkUrlResponses();
  }, [serviceURLs, urlsChecked]);

  // Memoize interface options to prevent unnecessary recalculations
  const interfaceOptions = useMemo(() => getInterfaceOptions(), [getInterfaceOptions]);

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="h6" component="div">
            Container Service URLs
          </Typography>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Container Service URLs {checkingUrls && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Typography>
        
        {tailscaleIp && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Tailscale interface detected: {tailscaleIp}
          </Alert>
        )}
        
        <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 2, mt: 1 }}>
          <InputLabel id="interface-select-label">Network Interface</InputLabel>
          <Select
            labelId="interface-select-label"
            value={selectedInterface}
            onChange={handleInterfaceChange}
            label="Network Interface"
          >
            {interfaceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {serviceURLs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {checkingUrls 
              ? "Checking URLs..." 
              : "No services found with exposed ports."}
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Container</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceURLs.map((service, index) => (
                  <TableRow key={`${service.containerName}-${service.port}`}>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>{service.containerName}</TableCell>
                    <TableCell>{service.port}</TableCell>
                    <TableCell>
                      {service.checkingResponse ? (
                        <CircularProgress size={16} />
                      ) : service.status === 'error' ? (
                        <Typography variant="body2" color="error">
                          {service.url}
                        </Typography>
                      ) : (
                        <Link 
                          href={service.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {service.url}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.checkingResponse ? (
                        <CircularProgress size={16} />
                      ) : service.status === 'error' ? (
                        <Chip 
                          label={service.statusCode ? `Error ${service.statusCode}` : "Not responding"} 
                          color="error" 
                          size="small" 
                        />
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {service.statusCode && (
                            <Chip 
                              label={`${service.statusCode}`} 
                              color={service.isSuccess ? "success" : "warning"}
                              size="small" 
                            />
                          )}
                          {service.hasHtmlResponse && (
                            <Chip 
                              label="HTML" 
                              color="info" 
                              size="small" 
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ContainerURLsCard; 