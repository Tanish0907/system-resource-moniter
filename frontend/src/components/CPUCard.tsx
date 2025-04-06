import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { CPUInfo } from '../types';

interface CPUCardProps {
  cpuData: CPUInfo | null;
  loading: boolean;
}

const CPUCard: React.FC<CPUCardProps> = ({ cpuData, loading }) => {
  if (loading || !cpuData) {
    return <div className="card">Loading CPU information...</div>;
  }

  // Format data for core utilization chart
  const coreUtilizationData = cpuData.utilization_per_core.map((util, index) => ({
    name: `Core ${index + 1}`,
    utilization: util
  }));

  // Format data for frequencies chart
  const frequenciesData = cpuData.frequencies.map((freq, index) => ({
    name: `Core ${index + 1}`,
    frequency: freq
  }));

  return (
    <div className="card">
      <h2>CPU Information</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Model:</span>
          <span className="value">{cpuData.model}</span>
        </div>
        <div className="info-item">
          <span className="label">Architecture:</span>
          <span className="value">{cpuData.architecture}</span>
        </div>
        <div className="info-item">
          <span className="label">Physical Cores:</span>
          <span className="value">{cpuData.physical_cores}</span>
        </div>
        <div className="info-item">
          <span className="label">Logical Cores:</span>
          <span className="value">{cpuData.logical_cores}</span>
        </div>
        <div className="info-item">
          <span className="label">Total Utilization:</span>
          <span className="value">{cpuData.utilization}%</span>
        </div>
        {cpuData.temperature && (
          <div className="info-item">
            <span className="label">Temperature:</span>
            <span className="value">{cpuData.temperature}°C</span>
          </div>
        )}
      </div>

      <h3>Core Utilization</h3>
      <div className="chart-container" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={coreUtilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="utilization" name="Utilization (%)" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Core Frequencies</h3>
      <div className="chart-container" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={frequenciesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" name="Frequency (MHz)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CPUCard; 