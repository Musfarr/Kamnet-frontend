import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  Alert,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { userApi, googleAuth } from '../../api/apiClient';
import { addUser, authFail, authStart, clearError } from '../../redux/features/userSlice';

function SignupModal({ open, handleClose, setLoginOpen, userLoginDialog }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    given_name: '',
    family_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Helper to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user corrects input
    if (error) setError('');
  };
  
  // Validate the form data
  const validateForm = () => {
    // For Task Posters (users), only OAuth is allowed, no form validation needed
    if (userLoginDialog) {
      setError('Please use Google Sign-Up for Task Posters');
      return false;
    }
    
    // For Task Doers (talents), validate form fields
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.name) {
      setError('Full name is required');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // For Task Posters (users), prompt to use Google Sign-Up instead
    if (userLoginDialog) {
      setError('Please use Google Sign-Up for Task Posters');
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      dispatch(authStart());
      
      // Check if talent already exists
      const existingCheck = await userApi.checkUserExists(formData.email, 'talent');
      
      if (existingCheck.exists) {
        setError('A user with this email already exists');
        dispatch(authFail('A user with this email already exists'));
        setLoading(false);
        return;
      }
      
      // Prepare talent data
      const talentData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        given_name: formData.given_name || formData.name.split(' ')[0],
        family_name: formData.family_name || (formData.name.split(' ').length > 1 ? formData.name.split(' ').slice(1).join(' ') : ''),
        picture: '',
        role: 'talent',
        profileCompleted: false // Talents need to complete their profile
      };
      
      // Register the talent
      const newTalent = await userApi.registerUser(talentData, 'talent');
      
      // Dispatch to Redux
      dispatch(addUser(newTalent));
      
      // Reset form & close modal
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        given_name: '',
        family_name: '',
      });
      handleClose();
      
      // Redirect to profile completion page
      navigate('/complete-profile');
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      dispatch(authFail(errorMessage));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google login success
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      dispatch(authStart());
      
      // Use the Google credential to authenticate with our backend
      const role = userLoginDialog ? 'user' : 'talent';
      const userData = await googleAuth(credentialResponse, role);
      
      // Dispatch to Redux
      dispatch(addUser(userData));
      
      // Close modal
      handleClose();
      
      // Redirect based on role and profile completion status
      if (role === 'talent' && !userData.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate(role === 'talent' ? '/talent/dashboard' : '/user/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      const errorMessage = 'Failed to sign up with Google. Please try again.';
      setError(errorMessage);
      dispatch(authFail(errorMessage));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google login error
  const handleGoogleSignupError = () => {
    const errorMessage = 'Google sign-in failed. Please try again.';
    setError(errorMessage);
    dispatch(authFail(errorMessage));
  };
  
  // Switch to login modal
  const switchToLogin = () => {
    handleClose();
    setLoginOpen(true);
  };
  
  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(clearError());
        setError('');
        handleClose();
      }}
      aria-labelledby="signup-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '8px',
        },
      }}
    >
      <DialogTitle id="signup-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" fontWeight="bold">
            Sign Up as {userLoginDialog ? 'Task Poster' : 'Task Doer'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {userLoginDialog ? (
          // For Task Posters (users) - Only Google signup
          <>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Task Posters can sign up using Google
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={handleGoogleSignupError}
                useOneTap
              />
            </Box>
          </>
        ) : (
          // For Task Doers (talents) - Form signup with Google option
          <>
            <form onSubmit={handleSignup}>
              <TextField
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleInputChange}
                required
                helperText="Password must be at least 8 characters long"
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                fullWidth
                variant="outlined"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ 
                  mt: 1, 
                  py: 1.5, 
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </form>
            
            <Divider sx={{ my: 2 }}>OR</Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={handleGoogleSignupError}
                useOneTap
              />
            </Box>
          </>
        )}
        
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Button
            color="primary"
            onClick={switchToLogin}
            sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
          >
            Log In
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default SignupModal;
