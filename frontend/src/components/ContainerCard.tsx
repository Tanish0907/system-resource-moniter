import React from 'react';
import { DockerContainerInfo } from '../types';

interface ContainerCardProps {
  containerData: DockerContainerInfo[];
  loading: boolean;
}

const ContainerCard: React.FC<ContainerCardProps> = ({ containerData, loading }) => {
  if (loading) {
    return <div className="card">Loading container information...</div>;
  }

  if (containerData.length === 0) {
    return (
      <div className="card">
        <h2>Docker Containers</h2>
        <p>No containers are currently running.</p>
      </div>
    );
  }

  // Format port mappings
  const formatPorts = (ports: Record<string, any>) => {
    if (!ports || Object.keys(ports).length === 0) {
      return 'None';
    }

    return Object.entries(ports)
      .map(([containerPort, hostBinding]) => {
        if (!hostBinding) return `${containerPort} (not published)`;
        
        const bindings = Array.isArray(hostBinding) ? hostBinding : [hostBinding];
        return bindings
          .map((binding: any) => {
            if (binding.HostIp && binding.HostPort) {
              return `${binding.HostIp}:${binding.HostPort}->${containerPort}`;
            } else if (binding.HostPort) {
              return `${binding.HostPort}->${containerPort}`;
            }
            return containerPort;
          })
          .join(', ');
      })
      .join(', ');
  };

  // Get status color based on container status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return '#4caf50'; // Green
      case 'exited':
        return '#f44336'; // Red
      case 'paused':
        return '#ff9800'; // Orange
      case 'created':
        return '#2196f3'; // Blue
      default:
        return '#9e9e9e'; // Grey
    }
  };

  return (
    <div className="card">
      <h2>Docker Containers</h2>
      
      <table className="container-table">
        <thead>
          <tr>
            <th>Container ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Status</th>
            <th>Ports</th>
          </tr>
        </thead>
        <tbody>
          {containerData.map((container) => (
            <tr key={container.id}>
              <td>{container.id}</td>
              <td>{container.name}</td>
              <td>{container.image}</td>
              <td>
                <span
                  className="status-indicator"
                  style={{
                    backgroundColor: getStatusColor(container.status),
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '5px'
                  }}
                />
                {container.status}
              </td>
              <td>{formatPorts(container.ports)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContainerCard; 