import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Kaam Connect
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.300' }}>
              Connecting talented workers with people who need tasks done. Find the right talent for your task or discover great opportunities to work.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  Home
                </Link>
              </li>
              <li>
                <Link component={RouterLink} to="/tasks" color="inherit" underline="hover">
                  Browse Tasks
                </Link>
              </li>
              <li>
                <Link component={RouterLink} to="/map" color="inherit" underline="hover">
                  Task Map
                </Link>
              </li>
            </ul>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </Grid>
        </Grid>
        
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'grey.400' }}>
            {'© '}
            {new Date().getFullYear()}
            {' Kaam Connect. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
