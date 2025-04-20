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
import Cookies from 'js-cookie';

const LoginModal = ({ open, handleClose, setSignupOpen, userLoginDialog }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user makes changes
    if (error) setError('');
  };

  // Form validation
  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }

    // Only validate password for talent login (users use OAuth only)
    if (!userLoginDialog && !formData.password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      dispatch(authStart());

      // For user role (task poster), redirect to Google OAuth
      if (userLoginDialog) {
        setError('Please use Google Sign-In for Task Posters');
        setLoading(false);
        return;
      }

      // For talent role (task doer), validate credentials
      const roleType = 'talent';
      const loginData = await userApi.loginUser(formData, roleType);

      if (!loginData.success) {
        setError(loginData.message || 'Login failed');
        dispatch(authFail(loginData.message || 'Login failed'));
        setLoading(false);
        return;
      }

      // Login successful
      dispatch(addUser(loginData));
      
      // Set cookies
      Cookies.set('user', JSON.stringify(loginData));
      Cookies.set('isLoggedIn', 'true');

      // Redirect based on profile completion
      if (!loginData.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate('/talent/dashboard');
      }
      
      // Reset form and close modal
      setFormData({ email: '', password: '' });
      handleClose();
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(authFail(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      dispatch(authStart());

      // Use the Google credential to authenticate with our backend
      const role = userLoginDialog ? 'user' : 'talent';
      const userData = await googleAuth(credentialResponse, role);

      if (!userData.success) {
        setError(userData.message || 'Google authentication failed');
        dispatch(authFail(userData.message || 'Google authentication failed'));
        setLoading(false);
        return;
      }

      // Dispatch to Redux
      dispatch(addUser(userData));
      
      // Set cookies
      Cookies.set('user', JSON.stringify(userData));
      Cookies.set('isLoggedIn', 'true');

      // Redirect based on role and profile completion
      if (role === 'talent' && !userData.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate(role === 'talent' ? '/talent/dashboard' : '/user/dashboard');
      }
      
      // Close modal
      handleClose();
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = 'Failed to sign in with Google. Please try again.';
      setError(errorMessage);
      dispatch(authFail(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleLoginError = () => {
    const errorMessage = 'Google sign-in failed. Please try again.';
    setError(errorMessage);
    dispatch(authFail(errorMessage));
  };

  // Switch to signup
  const switchToSignup = () => {
    handleClose();
    setSignupOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(clearError());
        setError('');
        handleClose();
      }}
      aria-labelledby="login-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '8px',
        },
      }}
    >
      <DialogTitle id="login-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" fontWeight="bold">
            Log In as {userLoginDialog ? 'Task Poster' : 'Task Doer'}
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
          // For user role (task poster) - Only Google login
          <>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Task Posters can sign in using Google
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
              />
            </Box>
          </>
        ) : (
          // For talent role (task doer) - Email/password login with Google option
          <>
            <form onSubmit={handleLogin}>
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
              </Button>
            </form>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
              />
            </Box>
          </>
        )}

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Button
            color="primary"
            onClick={switchToSignup}
            sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
          >
            Sign Up
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
