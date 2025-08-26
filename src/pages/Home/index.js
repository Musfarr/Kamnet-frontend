import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Chip,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFeaturedTasks } from '../../api/hooks/useTasks';
import SEO from '../../components/SEO/SEO';

const Home = () => {
  const navigate = useNavigate();
  
  // Use React Query hook for featured tasks
  const { 
    data: featuredTasks = [], 
    isLoading: loading, 
    error 
  } = useFeaturedTasks();

  // SEO schema for the homepage (Organization and WebSite)  
  const homePageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://kamnetcorp.com/#organization",
        "name": "Kamnet Marketplace",
        "url": "https://kamnetcorp.com/",
        "description": "Pakistan's trusted marketplace connecting task posters with task doers",
        "areaServed": {
          "@type": "Country",
          "name": "Pakistan"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://kamnetcorp.com/#website",
        "url": "https://kamnetcorp.com/",
        "name": "Kamnet Marketplace",
        "publisher": {
          "@id": "https://kamnetcorp.com/#organization"
        },
        "inLanguage": "en-PK",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": "https://kamnetcorp.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        ]
      }
    ]
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <SEO
        title="Kamnet Marketplace | Find Local Services & Tasks in Pakistan"
        description="Connect with skilled professionals or earn money completing tasks. Kamnet is Pakistan's trusted marketplace for finding local services and work opportunities."
        keywords="marketplace, pakistan, services, tasks, gigs, local services, freelance, karachi, lahore, islamabad"
        schema={homePageSchema}
      />
      {/* Hero section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 10, md: 15 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Find the right talent for any task
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Connect with skilled professionals to get your tasks done quickly and efficiently.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate('/tasks')}
                  sx={{ py: 1.5, px: 4, borderRadius: 2 }}
                >
                  Browse Tasks
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  onClick={() => navigate('/map')}
                  sx={{ py: 1.5, px: 4, borderRadius: 2 }}
                >
                  View Task Map
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Tasks section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Featured Tasks
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredTasks.map((task) => (
              <Grid item key={task.id} xs={12} sm={6} md={4}>
                <Card 
                  className="task-card"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      background: 'linear-gradient(45deg, #f3f4f6 0%, #e5e7eb 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                      fontSize: '2rem'
                    }}
                  >
                    📋
                  </Box>
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
                    <Typography gutterBottom variant="h6" component="h3">
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
                      fullWidth
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

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            onClick={() => navigate('/tasks')}
            sx={{ py: 1.5, px: 4, borderRadius: 2 }}
          >
            View All Tasks
          </Button>
        </Box>
      </Container>

      {/* How it works section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h1" color="primary" sx={{ mb: 2, opacity: 0.8 }}>1</Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Browse Tasks</Typography>
                <Typography>
                  Browse through available tasks in your area or category of expertise.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h1" color="primary" sx={{ mb: 2, opacity: 0.8 }}>2</Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Apply for Tasks</Typography>
                <Typography>
                  Create your profile and apply for tasks that match your skills and availability.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h1" color="primary" sx={{ mb: 2, opacity: 0.8 }}>3</Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Get Hired & Earn</Typography>
                <Typography>
                  Get selected by task posters, complete the work, and get paid for your services.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to action section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
              <Box
                sx={{
                  height: 250,
                  background: 'linear-gradient(45deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '4rem'
                }}
              >
                💼
              </Box>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Want to work?
                </Typography>
                <Typography variant="body1" paragraph>
                  Sign up as a Task Doer, complete your profile, and start earning money for your skills.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={() => {
                    // Will trigger the signup modal in Header component
                    const event = new CustomEvent('open-signup-modal', { detail: { isUser: false } });
                    window.dispatchEvent(event);
                  }}
                  sx={{ mt: 1 }}
                >
                  Become a Task Doer
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
              <Box
                sx={{
                  height: 250,
                  background: 'linear-gradient(45deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '4rem'
                }}
              >
                📝
              </Box>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Need something done?
                </Typography>
                <Typography variant="body1" paragraph>
                  Post a task and find the perfect talent to get your job done efficiently.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    // Will trigger the signup modal in Header component
                    const event = new CustomEvent('open-signup-modal', { detail: { isUser: true } });
                    window.dispatchEvent(event);
                  }}
                  sx={{ mt: 1 }}
                >
                  Post a Task
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
