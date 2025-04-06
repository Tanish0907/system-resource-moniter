import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RAMInfo } from '../types';

interface RAMCardProps {
  ramData: RAMInfo | null;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const RAMCard: React.FC<RAMCardProps> = ({ ramData, loading }) => {
  if (loading || !ramData) {
    return <div className="card">Loading RAM information...</div>;
  }

  const data = [
    { name: 'Used', value: ramData.used },
    { name: 'Free', value: ramData.free }
  ];

  // Format values for display
  const formatMemory = (value: number) => {
    if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} GB`;
    }
    return `${value} MB`;
  };

  return (
    <div className="card">
      <h2>RAM Information</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Total Memory:</span>
          <span className="value">{formatMemory(ramData.total)}</span>
        </div>
        <div className="info-item">
          <span className="label">Used Memory:</span>
          <span className="value">{formatMemory(ramData.used)}</span>
        </div>
        <div className="info-item">
          <span className="label">Free Memory:</span>
          <span className="value">{formatMemory(ramData.free)}</span>
        </div>
        <div className="info-item">
          <span className="label">Utilization:</span>
          <span className="value">{ramData.utilization.toFixed(2)}%</span>
        </div>
      </div>

      <div className="chart-container" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMemory(value as number)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RAMCard; 