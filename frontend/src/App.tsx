import React, { useState } from 'react';
import './App.css';
import { useSystemData } from './hooks/useSystemData';
import CPUCard from './components/CPUCard';
import RAMCard from './components/RAMCard';
import GPUCard from './components/GPUCard';
import DiskCard from './components/DiskCard';
import NetworkCard from './components/NetworkCard';
import ContainerCard from './components/ContainerCard';
import ContainerURLsCard from './components/ContainerURLsCard';
import PortsCard from './components/PortsCard';
import ProcessesCard from './components/ProcessesCard';

function App() {
  const { 
    loading, 
    error, 
    cpuData, 
    ramData, 
    gpuData, 
    diskData, 
    networkData, 
    containerData,
    portData,
    processData,
    refetch
  } = useSystemData();
  
  const [activeTab, setActiveTab] = useState('overview');

  if (error) {
    return (
      <div className="App error-container">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>System Resource Monitor</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'cpu' ? 'active' : ''} 
            onClick={() => setActiveTab('cpu')}
          >
            CPU
          </button>
          <button 
            className={activeTab === 'gpu' ? 'active' : ''} 
            onClick={() => setActiveTab('gpu')}
          >
            GPU
          </button>
          <button 
            className={activeTab === 'ram' ? 'active' : ''} 
            onClick={() => setActiveTab('ram')}
          >
            RAM
          </button>
          <button 
            className={activeTab === 'disk' ? 'active' : ''} 
            onClick={() => setActiveTab('disk')}
          >
            Disk
          </button>
          <button 
            className={activeTab === 'network' ? 'active' : ''} 
            onClick={() => setActiveTab('network')}
          >
            Network
          </button>
          <button 
            className={activeTab === 'processes' ? 'active' : ''} 
            onClick={() => setActiveTab('processes')}
          >
            Processes
          </button>
          <button 
            className={activeTab === 'ports' ? 'active' : ''} 
            onClick={() => setActiveTab('ports')}
          >
            Ports
          </button>
          <button 
            className={activeTab === 'containers' ? 'active' : ''} 
            onClick={() => setActiveTab('containers')}
          >
            Containers
          </button>
          <button 
            className={activeTab === 'urls' ? 'active' : ''} 
            onClick={() => setActiveTab('urls')}
          >
            URLs
          </button>
        </div>
      </header>

      <main className="App-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <CPUCard cpuData={cpuData} loading={loading} />
            <RAMCard ramData={ramData} loading={loading} />
            {gpuData.length > 0 && <GPUCard gpuData={gpuData} loading={loading} />}
            {/* <ContainerURLsCard containerData={containerData} networkData={networkData} loading={loading} /> */}
            {/* <PortsCard ports={portData} isLoading={loading} /> */}
          </div>
        )}

        {activeTab === 'cpu' && (
          <CPUCard cpuData={cpuData} loading={loading} />
        )}

        {activeTab === 'gpu' && (
          <GPUCard gpuData={gpuData} loading={loading} />
        )}

        {activeTab === 'ram' && (
          <RAMCard ramData={ramData} loading={loading} />
        )}

        {activeTab === 'disk' && (
          <DiskCard diskData={diskData} loading={loading} />
        )}

        {activeTab === 'network' && (
          <NetworkCard networkData={networkData} loading={loading} />
        )}

        {activeTab === 'processes' && (
          <ProcessesCard processes={processData} isLoading={loading} />
        )}

        {activeTab === 'ports' && (
          <PortsCard ports={portData} isLoading={loading} />
        )}

        {activeTab === 'containers' && (
          <ContainerCard containerData={containerData} loading={loading} />
        )}

        {activeTab === 'urls' && (
          <ContainerURLsCard containerData={containerData} networkData={networkData} loading={loading} />
        )}
      </main>

      <footer className="App-footer">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
        <button onClick={refetch} className="refresh-btn">
          Refresh Data
        </button>
      </footer>
    </div>
  );
}

export default App;
