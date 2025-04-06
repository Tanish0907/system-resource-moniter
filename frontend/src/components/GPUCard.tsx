import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GPUInfo } from '../types';

interface GPUCardProps {
  gpuData: GPUInfo[];
  loading: boolean;
}

const GPUCard: React.FC<GPUCardProps> = ({ gpuData, loading }) => {
  if (loading || gpuData.length === 0) {
    return <div className="card">Loading GPU information...</div>;
  }

  // Format memory values for display
  const formatMemory = (value: number) => {
    if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} GB`;
    }
    return `${value} MB`;
  };

  // Prepare data for utilization chart
  const utilizationData = gpuData.map((gpu) => ({
    name: `GPU ${gpu.id}`,
    utilization: gpu.utilization,
    temperature: gpu.temperature
  }));

  // Prepare data for memory chart
  const memoryData = gpuData.map((gpu) => ({
    name: `GPU ${gpu.id}`,
    used: gpu.memory_used,
    free: gpu.memory_free,
    total: gpu.memory_total
  }));

  return (
    <div className="card">
      <h2>GPU Information</h2>
      
      {gpuData.map((gpu) => (
        <div key={gpu.id} className="gpu-card">
          <h3>{gpu.name.toString()}</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Total Memory:</span>
              <span className="value">{formatMemory(gpu.memory_total)}</span>
            </div>
            <div className="info-item">
              <span className="label">Used Memory:</span>
              <span className="value">{formatMemory(gpu.memory_used)}</span>
            </div>
            <div className="info-item">
              <span className="label">Free Memory:</span>
              <span className="value">{formatMemory(gpu.memory_free)}</span>
            </div>
            <div className="info-item">
              <span className="label">Utilization:</span>
              <span className="value">{gpu.utilization}%</span>
            </div>
            <div className="info-item">
              <span className="label">Temperature:</span>
              <span className="value">{gpu.temperature}°C</span>
            </div>
          </div>
        </div>
      ))}

      {gpuData.length > 0 && (
        <>
          <h3>GPU Utilization</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="utilization" name="Utilization (%)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="temperature" name="Temperature (°C)" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3>GPU Memory Usage</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatMemory(value as number)} />
                <Legend />
                <Bar dataKey="used" name="Used Memory" stackId="a" fill="#82ca9d" />
                <Bar dataKey="free" name="Free Memory" stackId="a" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default GPUCard; 