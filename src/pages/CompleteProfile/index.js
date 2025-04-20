import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import { CloudUpload as UploadIcon, LocationOn } from '@mui/icons-material';
import { updateProfileStatus } from '../../redux/features/userSlice';
import { userApi } from '../../api/apiClient';

// Available skills for talents to select
const availableSkills = [
  'Plumbing', 'Electrical', 'Cleaning', 'Moving', 'Home Repair', 
  'Web Design', 'Graphic Design', 'Translation', 'Writing', 'Tutoring',
  'Language Instruction', 'Gardening', 'Pet Care', 'Photography', 
  'Video Editing', 'Carpentry', 'Painting', 'Cooking', 'Baking',
  'Driving', 'Delivery', 'Child Care', 'Elder Care', 'Shopping'
];

// Education levels
const educationLevels = [
  'High School', 'Associate Degree', 'Bachelor\'s Degree', 
  'Master\'s Degree', 'Doctorate', 'Trade School', 'Other'
];

const CompleteProfile = () => {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const redirectTo = location.state?.redirectTo || '/talent/dashboard';
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    // Personal Information
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    
    // Professional Information
    skills: [],
    education: '',
    experience: '',
    hourlyRate: '',
    
    // Verification
    idVerified: false,
    acceptTerms: false,
    
    // Profile image
    profileImage: null,
    imagePreview: user?.picture || '',
  });
  
  // Check if user is logged in and is a talent
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (user?.role !== 'talent') {
      navigate('/user/dashboard');
      return;
    }
    
    // If profile is already completed, redirect to dashboard
    if (user?.profileCompleted) {
      navigate('/talent/dashboard');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes changes
    if (error) setError('');
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle skills selection
  const handleSkillSelect = (skill) => {
    setProfileData(prev => {
      const skills = [...prev.skills];
      const skillIndex = skills.indexOf(skill);
      
      if (skillIndex === -1) {
        // Add skill if not already selected
        skills.push(skill);
      } else {
        // Remove skill if already selected
        skills.splice(skillIndex, 1);
      }
      
      return {
        ...prev,
        skills
      };
    });
  };
  
  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validate current step
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Personal Information
        if (!profileData.phone) {
          setError('Phone number is required');
          return false;
        }
        if (!profileData.address) {
          setError('Address is required');
          return false;
        }
        if (!profileData.city) {
          setError('City is required');
          return false;
        }
        if (!profileData.country) {
          setError('Country is required');
          return false;
        }
        if (!profileData.bio || profileData.bio.length < 10) {
          setError('Please provide a bio (at least 10 characters)');
          return false;
        }
        break;
        
      case 1: // Professional Information
        if (profileData.skills.length === 0) {
          setError('Please select at least one skill');
          return false;
        }
        if (!profileData.education) {
          setError('Education level is required');
          return false;
        }
        if (!profileData.hourlyRate) {
          setError('Hourly rate is required');
          return false;
        }
        if (isNaN(profileData.hourlyRate) || profileData.hourlyRate <= 0) {
          setError('Please enter a valid hourly rate');
          return false;
        }
        break;
        
      case 2: // Verification
        if (!profileData.acceptTerms) {
          setError('You must accept the terms and conditions');
          return false;
        }
        break;
        
      default:
        break;
    }
    
    return true;
  };
  
  // Move to next step
  const handleNext = () => {
    if (!validateStep()) return;
    
    setActiveStep(prev => prev + 1);
    setError('');
  };
  
  // Move to previous step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };
  
  // Submit profile data
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    try {
      setLoading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Add all profile data
      Object.keys(profileData).forEach(key => {
        if (key === 'skills') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else if (key === 'profileImage' && profileData[key]) {
          formData.append('profileImage', profileData[key]);
        } else if (key !== 'imagePreview') {
          formData.append(key, profileData[key]);
        }
      });
      
      // Mark profile as completed
      formData.append('profileCompleted', true);
      
      // Save profile data
      const updatedUser = await userApi.completeProfile(user.id, formData);
      
      // Update user in Redux store
      dispatch(updateProfileStatus(true));
      
      // Redirect to the specified location or dashboard
      navigate(redirectTo);
    } catch (err) {
      console.error('Error completing profile:', err);
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  mt: 2
                }}>
                  <Avatar
                    src={profileData.imagePreview}
                    alt={user?.name}
                    sx={{ width: 100, height: 100, mb: 2 }}
                  />
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                  >
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={profileData.country}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  placeholder="Tell us about yourself..."
                  helperText={`${profileData.bio.length}/500 characters`}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {availableSkills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onClick={() => handleSkillSelect(skill)}
                      color={profileData.skills.includes(skill) ? "primary" : "default"}
                      variant={profileData.skills.includes(skill) ? "filled" : "outlined"}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Education Level"
                  name="education"
                  value={profileData.education}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate ($)"
                  name="hourlyRate"
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Work Experience"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  placeholder="Describe your relevant work experience..."
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verification & Terms
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Complete your profile to start applying for tasks. Verified profiles get more job opportunities.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="idVerified"
                      checked={profileData.idVerified}
                      onChange={handleCheckboxChange}
                      color="primary"
                    />
                  }
                  label="I would like to verify my identity (Optional, but recommended)"
                />
                
                {profileData.idVerified && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    You'll be prompted to complete ID verification after submitting your profile.
                  </Alert>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Terms & Conditions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto', mb: 2 }}>
                  <Typography variant="body2">
                    By accepting these terms, you agree to the following:
                    
                    1. You will provide accurate and truthful information about your skills and experience.
                    
                    2. You will communicate professionally with task posters and clients.
                    
                    3. You will fulfill the tasks you accept to the best of your ability.
                    
                    4. You understand that Kaam Connect is a platform that connects task posters with task doers and is not responsible for the quality of work performed.
                    
                    5. You agree to our privacy policy and the processing of your personal data as described therein.
                  </Typography>
                </Paper>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptTerms"
                      checked={profileData.acceptTerms}
                      onChange={handleCheckboxChange}
                      color="primary"
                      required
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the Terms and Conditions and Privacy Policy
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  // Steps for the stepper
  const steps = ['Personal Information', 'Professional Details', 'Verification'];
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Complete Your Task Doer Profile
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Let's set up your profile so you can start applying for tasks
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Complete Profile'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;
