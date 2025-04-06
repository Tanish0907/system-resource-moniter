import React, { useEffect, useState } from 'react';
import { DockerContainerInfo, NetworkInterfaceInfo } from '../types';

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
}

const ContainerURLsCard: React.FC<ContainerURLsCardProps> = ({ containerData, networkData, loading }) => {
  const [tailscaleIp, setTailscaleIp] = useState<string | null>(null);

  // Find Tailscale interface IP
  useEffect(() => {
    if (networkData && networkData.length > 0) {
      // Look for interface names that might be Tailscale
      const tailscaleInterface = networkData.find(
        iface => 
          iface.name.toLowerCase().includes('tailscale') || 
          iface.name.toLowerCase().includes('ts')
      );

      if (tailscaleInterface && tailscaleInterface.ipv4) {
        setTailscaleIp(tailscaleInterface.ipv4);
      }
    }
  }, [networkData]);

  if (loading) {
    return <div className="card">Loading container URLs...</div>;
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
          
          // Use Tailscale IP if available, otherwise fall back to default logic
          const hostIp = tailscaleIp 
            ? tailscaleIp 
            : (binding.HostIp === '0.0.0.0' || binding.HostIp === '' ? 'localhost' : binding.HostIp);
          
          const protocol = containerPort.includes('tcp') ? 'http' : 'https';
          const url = `${protocol}://${hostIp}:${port}`;
          
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
            url,
            description,
            port
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
  const serviceURLs = Array.from(uniquePortMap.values());

  if (serviceURLs.length === 0) {
    return (
      <div className="card">
        <h2>Container Service URLs</h2>
        <p>No accessible services found. Make sure containers have exposed ports.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Container Service URLs</h2>
      {tailscaleIp && (
        <div className="tailscale-info">
          <span className="label">Using Tailscale IP: </span>
          <span className="value">{tailscaleIp}</span>
        </div>
      )}
      <p className="card-description">
        Quick access to services running in Docker containers. Click on any URL to open the service.
        <span className="deduplication-note">Note: Each port is shown only once, even if multiple containers use it.</span>
      </p>
      
      <table className="container-table url-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Container</th>
            <th>Port</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {serviceURLs.map((service, index) => (
            <tr key={index}>
              <td>{service.description}</td>
              <td>{service.containerName}</td>
              <td>{service.port}</td>
              <td>
                <a 
                  href={service.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="service-url"
                >
                  {service.url}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContainerURLsCard; 