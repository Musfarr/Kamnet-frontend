import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Drawer,
  useMediaQuery,
  Chip,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../api/apiClient';
import MapComponent from '../../components/Map/MapComponent';

const categories = [
  'All Categories',
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Moving',
  'Home Repair',
  'Web Design',
  'Language Instruction',
  'Tutoring',
  'Gardening',
  'Pet Care',
  'Photography',
];

const MapView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapTasks, setMapTasks] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Fetch tasks with map coordinates
  useEffect(() => {
    const fetchMapTasks = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = {
          hasCoordinates: true,
          limit: 100
        };
        
        // Add filters if selected
        if (filters.search) {
          params.search = filters.search;
        }
        if (filters.category && filters.category !== 'All Categories') {
          params.category = filters.category;
        }
        
        const response = await taskApi.getTasks(params);
        setMapTasks(response.data);
        
        // Transform tasks to markers format
        const markers = response.data.map(task => ({
          id: task.id,
          longitude: task.coordinates?.lng || 0,
          latitude: task.coordinates?.lat || 0,
          title: task.title,
          category: task.category,
          price: task.price,
        }));
        
        setMapMarkers(markers);
      } catch (err) {
        console.error('Error fetching map tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapTasks();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already applied through the filters state
  };
  
  // Handle task selection from map
  const handleTaskSelect = (taskId) => {
    const task = mapTasks.find(t => t.id === taskId);
    setSelectedTask(task);
    
    if (isMobile) {
      setDrawerOpen(true);
    }
  };
  
  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    
    // Center map on task (handled by parent component)
    const event = new CustomEvent('center-map', { 
      detail: { 
        lng: task.coordinates?.lng, 
        lat: task.coordinates?.lat,
        zoom: 14 
      }
    });
    window.dispatchEvent(event);
  };
  
  // Handle view task details
  const handleViewTaskDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Toggle filter drawer on mobile
  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header with search and filters */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        boxShadow: 1,
        zIndex: 10
      }}>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8} sm={6} md={3}>
              <Typography variant="h5" component="h1" fontWeight="bold">
                Task Map
              </Typography>
            </Grid>
            
            <Grid item xs={4} sm={6} md={6}>
              <Box component="form" onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  variant="outlined"
                  size="small"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: isMobile ? (
                      <InputAdornment position="end">
                        <IconButton 
                          edge="end" 
                          onClick={toggleFilterDrawer}
                          color={filterDrawerOpen ? "primary" : "default"}
                        >
                          <FilterIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
            </Grid>
            
            {!isMobile && (
              <Grid item md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category-select"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Task list sidebar (hidden on mobile) */}
        {!isMobile && (
          <Box
            component="aside"
            sx={{
              width: 320,
              height: '100%',
              overflow: 'auto',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {mapTasks.length} Tasks Found
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ my: 2 }}>
                  {error}
                </Alert>
              ) : mapTasks.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No tasks found. Try adjusting your filters.
                </Typography>
              ) : (
                <Box>
                  {mapTasks.map((task) => (
                    <Card
                      key={task.id}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        boxShadow: selectedTask?.id === task.id ? 3 : 1,
                        border: selectedTask?.id === task.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                        borderRadius: 2,
                      }}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip
                            label={task.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                          <Typography color="primary" fontWeight="bold">
                            ${task.price}
                          </Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {task.title}
                        </Typography>
                        
                        {task.location && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                            <LocationOn color="action" fontSize="small" sx={{ mt: 0.3 }} />
                            <Typography variant="body2" color="text.secondary">
                              {task.location}
                            </Typography>
                          </Box>
                        )}
                        
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTaskDetails(task.id);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {/* Map container */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {loading && !mapMarkers.length ? (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              zIndex: 10,
              bgcolor: 'background.paper',
              p: 3,
              borderRadius: 2,
              boxShadow: 3
            }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading map tasks...</Typography>
            </Box>
          ) : null}
          
          <MapComponent
            markers={mapMarkers}
            zoom={10}
            height="100%"
            onMarkerClick={handleTaskSelect}
          />
          
          {/* Selected task info panel on desktop */}
          {!isMobile && selectedTask && (
            <Paper
              sx={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                width: 320,
                zIndex: 10,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Task Details
                  </Typography>
                  <IconButton size="small" onClick={() => setSelectedTask(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {selectedTask.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                  <Chip
                    label={selectedTask.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`$${selectedTask.price}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" sx={{ my: 1 }}>
                  {selectedTask.description?.substring(0, 120)}
                  {selectedTask.description?.length > 120 ? '...' : ''}
                </Typography>
                
                {selectedTask.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <LocationOn color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {selectedTask.location}
                    </Typography>
                  </Box>
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => handleViewTaskDetails(selectedTask.id)}
                >
                  View Full Details
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
      
      {/* Mobile task drawer */}
      <Drawer
        anchor="bottom"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            height: '60%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            py: 3
          }
        }}
      >
        {selectedTask && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Task Details
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {selectedTask.title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
              <Chip
                label={selectedTask.category}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`$${selectedTask.price}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
            
            <Typography variant="body2" sx={{ my: 2 }}>
              {selectedTask.description}
            </Typography>
            
            {selectedTask.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <LocationOn color="action" />
                <Typography variant="body2">
                  {selectedTask.location}
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              onClick={() => handleViewTaskDetails(selectedTask.id)}
            >
              View Full Details
            </Button>
          </Box>
        )}
      </Drawer>
      
      {/* Mobile filter drawer */}
      <Drawer
        anchor="bottom"
        open={isMobile && filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '50%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            py: 3
          }
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Filter Tasks
            </Typography>
            <IconButton size="small" onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
            <InputLabel id="mobile-category-label">Category</InputLabel>
            <Select
              labelId="mobile-category-label"
              id="mobile-category-select"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setFilterDrawerOpen(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MapView;
