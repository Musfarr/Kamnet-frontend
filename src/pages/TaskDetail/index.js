import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  LocationOn,
  AttachMoney,
  Category,
  CalendarToday,
  Person,
  ArrowBack,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { taskApi } from '../../api/apiClient';
import MapComponent from '../../components/Map/MapComponent';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(state => state.user);
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyDialog, setApplyDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    price: '',
    applicationStatus: 'pending'
  });
  const [submitting, setSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const taskData = await taskApi.getTaskById(id);
        setTask(taskData);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Failed to load task details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  // Handle apply button click
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Trigger login modal from Header component
      const event = new CustomEvent('open-login-modal', { 
        detail: { redirectTo: location.pathname } 
      });
      window.dispatchEvent(event);
      return;
    }

    // If user is task poster, they can't apply
    if (user?.role === 'user') {
      alert('Task posters cannot apply for tasks. Please sign in as a Task Doer.');
      return;
    }

    // If talent profile not complete, redirect to complete profile page
    if (user?.role === 'talent' && !user?.profileCompleted) {
      navigate('/complete-profile', { 
        state: { redirectTo: location.pathname }
      });
      return;
    }

    // Open the apply dialog
    setApplyDialog(true);
  };

  // Handle application input changes
  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user makes changes
    if (applicationError) setApplicationError('');
  };

  // Validate application form
  const validateApplicationForm = () => {
    if (!applicationData.proposal.trim()) {
      setApplicationError('Please provide a proposal');
      return false;
    }
    
    if (!applicationData.price) {
      setApplicationError('Please provide your price offer');
      return false;
    }
    
    const priceNumber = Number(applicationData.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setApplicationError('Please provide a valid price offer');
      return false;
    }
    
    return true;
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!validateApplicationForm()) return;
    
    try {
      setSubmitting(true);
      
      const applicationPayload = {
        taskId: id,
        talentId: user.id,
        proposal: applicationData.proposal,
        price: parseFloat(applicationData.price),
        status: 'pending'
      };
      
      const response = await taskApi.applyForTask(applicationPayload);
      
      if (response.success) {
        setApplicationSuccess(true);
        
        // Reset form
        setApplicationData({
          proposal: '',
          price: '',
          applicationStatus: 'pending'
        });
        
        // Close dialog after success message
        setTimeout(() => {
          setApplyDialog(false);
          setApplicationSuccess(false);
        }, 2000);
      } else {
        setApplicationError(response.message || 'Application failed. Please try again.');
      }
    } catch (err) {
      console.error('Error applying for task:', err);
      setApplicationError(err.response?.data?.message || 'Failed to apply for task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle image click for enlargement
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close enlarged image
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Go back to tasks list
  const handleGoBack = () => {
    navigate('/tasks');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack}>
          Back to Tasks
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Task not found
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack}>
          Back to Tasks
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
      <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 3 }}>
        Back to Tasks
      </Button>

      <Grid container spacing={4}>
        {/* Task Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {task.title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={task.status || 'Open'}
                color={task.status === 'Completed' ? 'success' : 'primary'}
                size="small"
              />
              <Chip
                label={task.category}
                variant="outlined"
                size="small"
              />
            </Box>

            {/* Task Images */}
            {task.images && task.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <ImageList cols={task.images.length > 1 ? 3 : 1} gap={8}>
                  {task.images.map((image, index) => (
                    <ImageListItem 
                      key={index}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={image}
                        alt={`Task image ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* Task Info */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">Price</Typography>
                </Box>
                <Typography variant="body1">${task.price}</Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Category color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">Category</Typography>
                </Box>
                <Typography variant="body1">{task.category}</Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">Due Date</Typography>
                </Box>
                <Typography variant="body1">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">Location</Typography>
                </Box>
                <Typography variant="body1">{task.location || 'Remote'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Task Description */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {task.description}
            </Typography>

            {/* Task Requirements */}
            {task.requirements && (
              <>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Requirements
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                  {task.requirements}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Apply Button */}
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleApplyClick}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Apply for this Task
              </Button>
              <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                {isAuthenticated
                  ? 'Apply now to work on this task'
                  : 'Sign in as a Task Doer to apply for this task'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Task Location and Poster */}
        <Grid item xs={12} md={4}>
          {/* Task Poster */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3, boxShadow: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Posted By
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={task.postedBy?.picture || '/default-avatar.png'}
                alt={task.postedBy?.name}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {task.postedBy?.name || 'Anonymous User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {task.postedBy?.createdAt 
                    ? new Date(task.postedBy.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Task Location Map */}
          {task.location && task.coordinates && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Task Location
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {task.location}
              </Typography>
              <Box sx={{ height: 250, borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent
                  center={[task.coordinates.lng, task.coordinates.lat]}
                  markers={[{
                    id: task.id,
                    longitude: task.coordinates.lng,
                    latitude: task.coordinates.lat,
                    title: task.title
                  }]}
                  zoom={13}
                />
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog
        open={applyDialog}
        onClose={() => {
          if (!submitting) {
            setApplyDialog(false);
            setApplicationError('');
          }
        }}
        fullWidth
        maxWidth="sm"
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
              Apply for Task
            </Typography>
            <IconButton
              onClick={() => {
                if (!submitting) {
                  setApplyDialog(false);
                  setApplicationError('');
                }
              }}
              size="small"
              disabled={submitting}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {applicationSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Your application has been submitted successfully!
            </Alert>
          ) : (
            <>
              {applicationError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {applicationError}
                </Alert>
              )}

              <Typography variant="subtitle1" sx={{ mb: 2, mt: 1 }}>
                You are applying for: <strong>{task.title}</strong>
              </Typography>

              <TextField
                name="proposal"
                label="Your Proposal"
                placeholder="Explain why you're a good fit for this task..."
                multiline
                rows={4}
                fullWidth
                value={applicationData.proposal}
                onChange={handleApplicationChange}
                disabled={submitting}
                sx={{ mb: 3 }}
              />

              <TextField
                name="price"
                label="Your Price ($)"
                type="number"
                fullWidth
                value={applicationData.price}
                onChange={handleApplicationChange}
                disabled={submitting}
                sx={{ mb: 3 }}
                helperText={`Task budget: $${task.price}`}
              />
            </>
          )}
        </DialogContent>

        {!applicationSuccess && (
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => {
                if (!submitting) {
                  setApplyDialog(false);
                  setApplicationError('');
                }
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitApplication}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Enlarged Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseImage}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleCloseImage} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center' }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged task image"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TaskDetail;
