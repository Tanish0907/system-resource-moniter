import React, { useState, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  TablePagination,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MemoryIcon from '@mui/icons-material/Memory';
import PeopleIcon from '@mui/icons-material/People';
import { ProcessInfo } from '../types';

interface ProcessesCardProps {
  processes: ProcessInfo[];
  isLoading: boolean;
}

const ProcessesCard: React.FC<ProcessesCardProps> = ({ processes, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<'memory' | 'cpu' | 'pid'>('memory');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSort = (column: 'memory' | 'cpu' | 'pid') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  const filteredAndSortedProcesses = useMemo(() => {
    return processes
      .filter(process => 
        process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.cmdline.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.pid.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'memory') {
          comparison = a.memory_percent - b.memory_percent;
        } else if (sortBy === 'cpu') {
          comparison = a.cpu_percent - b.cpu_percent;
        } else if (sortBy === 'pid') {
          comparison = a.pid - b.pid;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [processes, searchTerm, sortBy, sortOrder]);
  
  const paginatedProcesses = filteredAndSortedProcesses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'running':
        return 'success';
      case 'sleeping':
        return 'default';
      case 'stopped':
        return 'warning';
      case 'zombie':
        return 'error';
      default:
        return 'default';
    }
  };
  
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="h6" component="div">
            Processes & Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Processes & Services ({filteredAndSortedProcesses.length})
        </Typography>
        
        <TextField
          label="Search processes"
          variant="outlined"
          size="small"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            icon={<MemoryIcon />}
            label="Sort by Memory" 
            color={sortBy === 'memory' ? 'primary' : 'default'}
            onClick={() => handleSort('memory')}
            variant={sortBy === 'memory' ? 'filled' : 'outlined'}
          />
          <Chip 
            icon={<MemoryIcon />}
            label="Sort by CPU" 
            color={sortBy === 'cpu' ? 'primary' : 'default'}
            onClick={() => handleSort('cpu')}
            variant={sortBy === 'cpu' ? 'filled' : 'outlined'}
          />
          <Chip 
            label="Sort by PID" 
            color={sortBy === 'pid' ? 'primary' : 'default'}
            onClick={() => handleSort('pid')}
            variant={sortBy === 'pid' ? 'filled' : 'outlined'}
          />
        </Box>
        
        {filteredAndSortedProcesses.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No processes found matching your search.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>CPU %</TableCell>
                    <TableCell>Memory %</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Threads</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProcesses.map((process) => (
                    <TableRow key={process.pid}>
                      <TableCell>{process.pid}</TableCell>
                      <TableCell>
                        <Tooltip title={process.cmdline.join(' ')}>
                          <Typography variant="body2">{process.name}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<PeopleIcon />}
                          label={process.username} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={process.status} 
                          size="small" 
                          color={getStatusColor(process.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{process.cpu_percent.toFixed(1)}%</TableCell>
                      <TableCell>{process.memory_percent.toFixed(1)}%</TableCell>
                      <TableCell>{formatTime(process.created_time)}</TableCell>
                      <TableCell>{process.num_threads}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredAndSortedProcesses.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessesCard; 