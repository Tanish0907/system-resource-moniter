import React from 'react';
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
  Chip,
  Tooltip
} from '@mui/material';
import { PortInfo } from '../types';

interface PortsCardProps {
  ports: PortInfo[];
  isLoading: boolean;
}

const PortsCard: React.FC<PortsCardProps> = ({ ports, isLoading }) => {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="h6" component="div">
            Open Ports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'ESTABLISHED':
        return 'success';
      case 'LISTEN':
        return 'warning';
      case 'TIME_WAIT':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Open Ports ({ports.length})
        </Typography>
        
        {ports.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No open ports detected or insufficient permissions.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Protocol</TableCell>
                  <TableCell>Local Address</TableCell>
                  <TableCell>Remote Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Process</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ports.map((port, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip 
                        label={port.protocol} 
                        size="small" 
                        color={port.protocol === 'TCP' ? 'primary' : 'secondary'} 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {port.local_ip}:{port.local_port}
                    </TableCell>
                    <TableCell>
                      {port.remote_ip && port.remote_port 
                        ? `${port.remote_ip}:${port.remote_port}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={port.status} 
                        size="small" 
                        color={getStatusColor(port.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {port.pid && port.process_name ? (
                        <Tooltip title={`PID: ${port.pid}`}>
                          <Typography variant="body2">{port.process_name}</Typography>
                        </Tooltip>
                      ) : (
                        '-'
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

export default PortsCard; 