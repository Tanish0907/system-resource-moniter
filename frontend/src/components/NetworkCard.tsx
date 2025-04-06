import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NetworkInterfaceInfo } from '../types';

interface NetworkCardProps {
  networkData: NetworkInterfaceInfo[];
  loading: boolean;
}

const NetworkCard: React.FC<NetworkCardProps> = ({ networkData, loading }) => {
  if (loading || networkData.length === 0) {
    return <div className="card">Loading network information...</div>;
  }

  // Format byte values for display
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Prepare data for traffic chart
  const trafficData = networkData.map((iface) => ({
    name: iface.name,
    sent: iface.bytes_sent,
    received: iface.bytes_recv
  }));

  // Prepare data for error chart
  const errorData = networkData.map((iface) => ({
    name: iface.name,
    inErrors: iface.errin,
    outErrors: iface.errout,
    dropIn: iface.dropin,
    dropOut: iface.dropout
  }));

  return (
    <div className="card">
      <h2>Network Interfaces</h2>
      
      {networkData.map((iface, index) => (
        <div key={index} className="network-card">
          <h3>{iface.name}</h3>
          <div className="info-grid">
            {iface.ipv4 && (
              <div className="info-item">
                <span className="label">IPv4:</span>
                <span className="value">{iface.ipv4}</span>
              </div>
            )}
            {iface.ipv6 && (
              <div className="info-item">
                <span className="label">IPv6:</span>
                <span className="value">{iface.ipv6}</span>
              </div>
            )}
            {iface.mac && (
              <div className="info-item">
                <span className="label">MAC:</span>
                <span className="value">{iface.mac}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">Bytes Sent:</span>
              <span className="value">{formatBytes(iface.bytes_sent)}</span>
            </div>
            <div className="info-item">
              <span className="label">Bytes Received:</span>
              <span className="value">{formatBytes(iface.bytes_recv)}</span>
            </div>
            <div className="info-item">
              <span className="label">Packets Sent:</span>
              <span className="value">{iface.packets_sent}</span>
            </div>
            <div className="info-item">
              <span className="label">Packets Received:</span>
              <span className="value">{iface.packets_recv}</span>
            </div>
            <div className="info-item">
              <span className="label">Input Errors:</span>
              <span className="value">{iface.errin}</span>
            </div>
            <div className="info-item">
              <span className="label">Output Errors:</span>
              <span className="value">{iface.errout}</span>
            </div>
            <div className="info-item">
              <span className="label">Input Drops:</span>
              <span className="value">{iface.dropin}</span>
            </div>
            <div className="info-item">
              <span className="label">Output Drops:</span>
              <span className="value">{iface.dropout}</span>
            </div>
          </div>
        </div>
      ))}

      {networkData.length > 0 && (
        <>
          <h3>Network Traffic</h3>
          <div className="chart-container" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatBytes(value as number)} />
                <Legend />
                <Bar dataKey="sent" name="Bytes Sent" fill="#8884d8" />
                <Bar dataKey="received" name="Bytes Received" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3>Network Errors</h3>
          <div className="chart-container" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inErrors" name="Input Errors" fill="#8884d8" />
                <Bar dataKey="outErrors" name="Output Errors" fill="#82ca9d" />
                <Bar dataKey="dropIn" name="Input Drops" fill="#ff8042" />
                <Bar dataKey="dropOut" name="Output Drops" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkCard; 