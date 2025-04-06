import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DiskInfo } from '../types';

interface DiskCardProps {
  diskData: DiskInfo[];
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DiskCard: React.FC<DiskCardProps> = ({ diskData, loading }) => {
  if (loading || diskData.length === 0) {
    return <div className="card">Loading disk information...</div>;
  }

  // Format values for display
  const formatStorage = (value: number) => {
    if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} TB`;
    }
    return `${value} GB`;
  };

  // Prepare data for storage chart
  const storageData = diskData.map((disk) => ({
    name: disk.mountpoint,
    used: disk.used,
    free: disk.free,
    total: disk.total
  }));

  // Prepare data for pie charts
  const pieChartData = diskData.map((disk) => [
    { name: 'Used', value: disk.used },
    { name: 'Free', value: disk.free }
  ]);

  return (
    <div className="card">
      <h2>Disk Information</h2>
      
      {diskData.map((disk, index) => (
        <div key={index} className="disk-card">
          <h3>{disk.mountpoint}</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Device:</span>
              <span className="value">{disk.device}</span>
            </div>
            <div className="info-item">
              <span className="label">File System:</span>
              <span className="value">{disk.fstype}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Space:</span>
              <span className="value">{formatStorage(disk.total)}</span>
            </div>
            <div className="info-item">
              <span className="label">Used Space:</span>
              <span className="value">{formatStorage(disk.used)}</span>
            </div>
            <div className="info-item">
              <span className="label">Free Space:</span>
              <span className="value">{formatStorage(disk.free)}</span>
            </div>
            <div className="info-item">
              <span className="label">Utilization:</span>
              <span className="value">{disk.utilization.toFixed(2)}%</span>
            </div>
          </div>
          
          <div className="chart-container" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData[index]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData[index].map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatStorage(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}

      {diskData.length > 1 && (
        <>
          <h3>Storage Comparison</h3>
          <div className="chart-container" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatStorage(value as number)} />
                <Legend />
                <Bar dataKey="used" name="Used Space" stackId="a" fill="#8884d8" />
                <Bar dataKey="free" name="Free Space" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default DiskCard; 