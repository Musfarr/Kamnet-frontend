import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { taskApi, userApi } from '../../api/apiClient';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserDashboard = () => {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  
  // Post task dialog state
  const [postDialog, setPostDialog] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    dueDate: ''
  });
  
  // Delete task dialog state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Load user's tasks
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await userApi.getUserTasks(user.id);
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching user tasks:', err);
        setError('Failed to load your tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserTasks();
  }, [user, refresh]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle post task dialog
  const handleOpenPostDialog = () => {
    setPostDialog(true);
  };
  
  const handleClosePostDialog = () => {
    setPostDialog(false);
    // Reset form
    setTaskData({
      title: '',
      description: '',
      price: '',
      category: '',
      location: '',
      dueDate: ''
    });
  };
  
  // Handle task input changes
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit new task
  const handleSubmitTask = async () => {
    try {
      // Create task with user ID
      const newTaskData = {
        ...taskData,
        userId: user.id,
        status: 'Open',
        createdAt: new Date().toISOString()
      };
      
      await taskApi.createTask(newTaskData);
      
      // Close dialog and refresh tasks
      handleClosePostDialog();
      setRefresh(!refresh);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };
  
  // Handle delete task dialog
  const handleOpenDeleteDialog = (task) => {
    setTaskToDelete(task);
    setDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setTaskToDelete(null);
  };
  
  // Delete task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await taskApi.deleteTask(taskToDelete.id);
      
      // Close dialog and refresh tasks
      handleCloseDeleteDialog();
      setRefresh(!refresh);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };
  
  // Task categories for dropdown
  const categories = [
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Dashboard Header */}
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1">
            Task Poster Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your tasks and find qualified talent
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenPostDialog}
            sx={{ mt: { xs: 2, md: 0 } }}
          >
            Post New Task
          </Button>
        </Grid>
      </Grid>
      
      {/* User Profile Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={user?.picture}
                alt={user?.name}
                sx={{ width: 80, height: 80, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Task Poster
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tasks Posted
              </Typography>
              <Typography variant="body1">{tasks.length}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Tasks Tab Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="dashboard tabs"
                sx={{ px: 2 }}
              >
                <Tab label="Active Tasks" id="dashboard-tab-0" />
                <Tab label="Completed Tasks" id="dashboard-tab-1" />
                <Tab label="Applications" id="dashboard-tab-2" />
              </Tabs>
            </Box>
            
            {/* Active Tasks Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3, pb: 3 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : tasks.filter(task => task.status !== 'Completed').length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      You don't have any active tasks
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenPostDialog}
                      sx={{ mt: 2 }}
                    >
                      Post Your First Task
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => setRefresh(!refresh)}
                        size="small"
                      >
                        Refresh
                      </Button>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {tasks
                        .filter(task => task.status !== 'Completed')
                        .map((task) => (
                          <Grid item xs={12} key={task.id}>
                            <Card sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box>
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                      <Chip 
                                        label={task.status} 
                                        color={
                                          task.status === 'Open' ? 'primary' : 
                                          task.status === 'Assigned' ? 'success' : 'default'
                                        }
                                        size="small"
                                      />
                                      <Chip 
                                        label={task.category} 
                                        variant="outlined" 
                                        size="small"
                                      />
                                      <Chip 
                                        label={`$${task.price}`} 
                                        variant="outlined" 
                                        size="small"
                                      />
                                    </Box>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Posted: {new Date(task.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Applications: {task.applications?.length || 0}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {task.description.substring(0, 150)}
                                  {task.description.length > 150 ? '...' : ''}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                <Button
                                  size="small"
                                  onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                  View Details
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  color="error"
                                  onClick={() => handleOpenDeleteDialog(task)}
                                >
                                  Delete
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </TabPanel>
            
            {/* Completed Tasks Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3, pb: 3 }}>
                {tasks.filter(task => task.status === 'Completed').length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      You don't have any completed tasks
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {tasks
                      .filter(task => task.status === 'Completed')
                      .map((task) => (
                        <Grid item xs={12} key={task.id}>
                          <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="h6">{task.title}</Typography>
                                  <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                    <Chip 
                                      label="Completed" 
                                      color="success" 
                                      size="small"
                                    />
                                    <Chip 
                                      label={task.category} 
                                      variant="outlined" 
                                      size="small"
                                    />
                                    <Chip 
                                      label={`$${task.price}`} 
                                      variant="outlined" 
                                      size="small"
                                    />
                                  </Box>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Completed: {task.completedDate ? new Date(task.completedDate).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {task.description.substring(0, 150)}
                                {task.description.length > 150 ? '...' : ''}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                              >
                                View Details
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>
            </TabPanel>
            
            {/* Applications Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  View applications for your tasks by clicking on the task details
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Post Task Dialog */}
      <Dialog
        open={postDialog}
        onClose={handleClosePostDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" fontWeight="bold">
              Post a New Task
            </Typography>
            <IconButton onClick={handleClosePostDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={taskData.title}
                onChange={handleTaskInputChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={taskData.category}
                onChange={handleTaskInputChange}
                required
                margin="normal"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget ($)"
                name="price"
                type="number"
                value={taskData.price}
                onChange={handleTaskInputChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={taskData.location}
                onChange={handleTaskInputChange}
                margin="normal"
                placeholder="e.g., Remote or New York, NY"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={taskData.dueDate}
                onChange={handleTaskInputChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Description"
                name="description"
                value={taskData.description}
                onChange={handleTaskInputChange}
                required
                multiline
                rows={4}
                margin="normal"
                placeholder="Describe what you need done, requirements, and any other details..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClosePostDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmitTask}
            disabled={!taskData.title || !taskData.description || !taskData.price || !taskData.category}
          >
            Post Task
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Task Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteTask}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
