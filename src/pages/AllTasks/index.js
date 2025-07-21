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
import { useTasks } from '../../api/hooks/useTasks';
import SEO from '../../components/SEO/SEO';

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
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahria Town',
  'DHA Lahore',
  'Gulberg',
  'Model Town'
];

const AllTasks = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    location: 'All Locations'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.user);
  const navigate = useNavigate();

  // Build query params for React Query
  const queryParams = {
    page,
    limit: 9
  };

  // Add filters if selected
  if (filters.search) {
    queryParams.search = filters.search;
  }
  if (filters.category && filters.category !== 'All Categories') {
    queryParams.category = filters.category;
  }
  if (filters.location && filters.location !== 'All Locations') {
    queryParams.location = filters.location;
  }

  // Use React Query hook for tasks
  const { 
    data: tasksResponse, 
    isLoading: loading, 
    error 
  } = useTasks(queryParams);

  const tasks = tasksResponse?.data || [];
  const totalPages = tasksResponse?.totalPages || 1;

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
  
  // Generate schema.org structured data for ItemList of tasks
  const generateTasksListSchema = () => {
    if (!tasks || tasks.length === 0) return null;
    
    // Create list items for each task
    const itemListElements = tasks.map((task, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": task.title,
        "description": task.description,
        "offers": {
          "@type": "Offer",
          "price": task.budget,
          "priceCurrency": "PKR"
        },
        "serviceLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": task.location
          }
        },
        "url": `${window.location.origin}/tasks/${task.id}`
      }
    }));
    
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": itemListElements,
      "numberOfItems": tasks.length,
      "name": "Available Tasks in Pakistan - Kamnet Marketplace"
    };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
      <SEO
        title="All Tasks | Find Services & Work Opportunities in Pakistan | Kamnet"
        description="Browse available tasks and services across Pakistan. Find work opportunities or hire skilled professionals for your needs on Kamnet Marketplace."
        keywords="tasks, services, jobs, freelance, pakistan, karachi, lahore, islamabad, gigs"
        type="website"
        schema={generateTasksListSchema()}
      />
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
                      Rs. {task.price}
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
