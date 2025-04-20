import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { taskApi } from '../../api/apiClient';

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
  'Photography'
];

const locations = [
  'All Locations',
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA'
];

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    location: 'All Locations'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.user);
  const navigate = useNavigate();

  // Fetch tasks when page or filters change
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');

        // Build query params
        const params = {
          page,
          limit: 9
        };

        // Add filters if selected
        if (filters.search) {
          params.search = filters.search;
        }
        if (filters.category && filters.category !== 'All Categories') {
          params.category = filters.category;
        }
        if (filters.location && filters.location !== 'All Locations') {
          params.location = filters.location;
        }

        const response = await taskApi.getTasks(params);
        setTasks(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page, filters]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top on page change
    window.scrollTo(0, 0);
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPage(1);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already applied through the filters state
  };

  // Handle apply for task
  const handleApplyForTask = (taskId) => {
    if (!isAuthenticated) {
      // Trigger login modal - we'll notify the Header component
      const event = new CustomEvent('open-login-modal', { 
        detail: { redirectTo: `/tasks/${taskId}` } 
      });
      window.dispatchEvent(event);
      return;
    }

    // If user is a task poster, they can't apply for tasks
    if (user?.role === 'user') {
      alert('Task posters cannot apply for tasks. Please sign in as a Task Doer.');
      return;
    }

    // If talent profile is not complete, redirect to complete profile page
    if (user?.role === 'talent' && !user?.profileCompleted) {
      navigate('/complete-profile', { 
        state: { redirectTo: `/tasks/${taskId}` }
      });
      return;
    }

    // Navigate to task detail page where they can apply
    navigate(`/tasks/${taskId}`);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            All Tasks
          </Typography>
          <Button
            startIcon={<FilterIcon />}
            onClick={toggleFilters}
            color="primary"
            variant={showFilters ? "contained" : "outlined"}
          >
            Filters
          </Button>
        </Box>

        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            variant="outlined"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Filters */}
        {showFilters && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  id="location-select"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tasks Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters or search to find tasks.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item key={task.id} xs={12} sm={6} md={4}>
              <Card 
                className="task-card"
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={(task.images && task.images[0]) || '/task-placeholder.jpg'}
                  alt={task.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      label={task.category}
                      size="small"
                      color="primary"
                      sx={{ borderRadius: 1 }}
                    />
                    <Typography 
                      variant="h6" 
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      ${task.price}
                    </Typography>
                  </Box>
                  <Typography gutterBottom variant="h6" component="h2">
                    {task.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {task.description}
                  </Typography>
                  {task.location && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      📍 {task.location}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="small"
                    onClick={() => handleApplyForTask(task.id)}
                  >
                    Apply
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default AllTasks;
