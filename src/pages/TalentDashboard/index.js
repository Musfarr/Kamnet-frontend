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
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocalOffer as PriceIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { userApi, taskApi } from '../../api/apiClient';

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

const TalentDashboard = () => {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  
  // Check if user is authenticated and has completed profile
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (user?.role !== 'talent') {
      navigate('/user/dashboard');
      return;
    }
    
    if (!user?.profileCompleted) {
      navigate('/complete-profile');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Load talent's applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await userApi.getTalentApplications(user.id);
        setApplications(response.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [user, refresh]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open application detail dialog
  const handleOpenDetailDialog = (application) => {
    setApplicationDetail(application);
    setDetailDialog(true);
  };
  
  // Close application detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialog(false);
    setApplicationDetail(null);
  };
  
  // Get task status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Skills to display (from user profile)
  const userSkills = user?.skills || [];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Dashboard Header */}
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1">
            Task Doer Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your applications and find tasks to complete
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/tasks')}
            sx={{ mt: { xs: 2, md: 0 } }}
          >
            Find Tasks
          </Button>
        </Grid>
      </Grid>
      
      {/* Talent Profile Card */}
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
                  Task Doer
                </Typography>
                {user?.idVerified && (
                  <Chip 
                    label="Verified" 
                    color="success" 
                    size="small" 
                    sx={{ mt: 1 }} 
                  />
                )}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Profile details */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Education</Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 3 }}>
                {user?.education || 'Not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Experience</Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 3 }}>
                {user?.experience || 'Not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PriceIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Hourly Rate</Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 3 }}>
                ${user?.hourlyRate || 'Not specified'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Skills */}
            <Typography variant="subtitle2" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userSkills.length > 0 ? (
                userSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No skills specified
                </Typography>
              )}
            </Box>
            
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 3 }}
              onClick={() => navigate('/talent/profile')}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>
        
        {/* Applications Tab Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="dashboard tabs"
                sx={{ px: 2 }}
              >
                <Tab label="All Applications" id="dashboard-tab-0" />
                <Tab label="Accepted" id="dashboard-tab-1" />
                <Tab label="Pending" id="dashboard-tab-2" />
              </Tabs>
            </Box>
            
            {/* All Applications Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3, pb: 3 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => setRefresh(!refresh)}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : applications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      You haven't applied to any tasks yet
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SearchIcon />}
                      onClick={() => navigate('/tasks')}
                      sx={{ mt: 2 }}
                    >
                      Find Tasks to Apply
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {applications.map((application) => (
                      <Grid item xs={12} key={application.id}>
                        <Card sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6">{application.task?.title}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                  <Chip 
                                    label={application.status} 
                                    color={getStatusColor(application.status)} 
                                    size="small"
                                  />
                                  {application.task?.category && (
                                    <Chip 
                                      label={application.task.category} 
                                      variant="outlined" 
                                      size="small"
                                    />
                                  )}
                                  <Chip 
                                    label={`$${application.price || application.task?.price}`} 
                                    variant="outlined" 
                                    size="small"
                                  />
                                </Box>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Applied: {new Date(application.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {application.proposal?.substring(0, 120)}
                              {application.proposal?.length > 120 ? '...' : ''}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              onClick={() => handleOpenDetailDialog(application)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="small"
                              onClick={() => navigate(`/tasks/${application.task?.id}`)}
                            >
                              View Task
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </TabPanel>
            
            {/* Accepted Applications Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3, pb: 3 }}>
                {applications.filter(app => app.status === 'accepted').length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      You don't have any accepted applications yet
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {applications
                      .filter(app => app.status === 'accepted')
                      .map((application) => (
                        <Grid item xs={12} key={application.id}>
                          <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="h6">{application.task?.title}</Typography>
                                  <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                    <Chip 
                                      label="Accepted" 
                                      color="success" 
                                      size="small"
                                    />
                                    {application.task?.category && (
                                      <Chip 
                                        label={application.task.category} 
                                        variant="outlined" 
                                        size="small"
                                      />
                                    )}
                                    <Chip 
                                      label={`$${application.price || application.task?.price}`} 
                                      variant="outlined" 
                                      size="small"
                                    />
                                  </Box>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Accepted: {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {application.proposal?.substring(0, 120)}
                                {application.proposal?.length > 120 ? '...' : ''}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                onClick={() => handleOpenDetailDialog(application)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="small"
                                onClick={() => navigate(`/tasks/${application.task?.id}`)}
                              >
                                View Task
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>
            </TabPanel>
            
            {/* Pending Applications Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3, pb: 3 }}>
                {applications.filter(app => app.status === 'pending').length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      You don't have any pending applications
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {applications
                      .filter(app => app.status === 'pending')
                      .map((application) => (
                        <Grid item xs={12} key={application.id}>
                          <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="h6">{application.task?.title}</Typography>
                                  <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                    <Chip 
                                      label="Pending" 
                                      color="warning" 
                                      size="small"
                                    />
                                    {application.task?.category && (
                                      <Chip 
                                        label={application.task.category} 
                                        variant="outlined" 
                                        size="small"
                                      />
                                    )}
                                    <Chip 
                                      label={`$${application.price || application.task?.price}`} 
                                      variant="outlined" 
                                      size="small"
                                    />
                                  </Box>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {application.proposal?.substring(0, 120)}
                                {application.proposal?.length > 120 ? '...' : ''}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                onClick={() => handleOpenDetailDialog(application)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="small"
                                onClick={() => navigate(`/tasks/${application.task?.id}`)}
                              >
                                View Task
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Application Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={handleCloseDetailDialog}
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
              Application Details
            </Typography>
            <IconButton onClick={handleCloseDetailDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {applicationDetail && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {applicationDetail.task?.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={applicationDetail.status} 
                    color={getStatusColor(applicationDetail.status)} 
                  />
                  {applicationDetail.task?.category && (
                    <Chip 
                      label={applicationDetail.task.category} 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Proposal
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1">
                    {applicationDetail.proposal}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Application Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PriceIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Your Price" 
                      secondary={`$${applicationDetail.price}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Task Budget" 
                      secondary={`$${applicationDetail.task?.price}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Applied On" 
                      secondary={new Date(applicationDetail.createdAt).toLocaleDateString()} 
                    />
                  </ListItem>
                  {applicationDetail.status !== 'pending' && applicationDetail.updatedAt && (
                    <ListItem>
                      <ListItemText 
                        primary={`${applicationDetail.status === 'accepted' ? 'Accepted' : 'Rejected'} On`} 
                        secondary={new Date(applicationDetail.updatedAt).toLocaleDateString()} 
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              
              {applicationDetail.status === 'accepted' && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Congratulations! Your application has been accepted. Please contact the task poster for further instructions.
                  </Alert>
                </Grid>
              )}
              
              {applicationDetail.status === 'rejected' && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This application was not selected. Don't worry, keep applying to other tasks that match your skills.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              handleCloseDetailDialog();
              navigate(`/tasks/${applicationDetail?.task?.id}`);
            }}
          >
            View Complete Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TalentDashboard;
