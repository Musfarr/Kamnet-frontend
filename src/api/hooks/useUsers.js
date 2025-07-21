import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, mockUtils } from '../apiClient';

// Query keys for users
export const USER_KEYS = {
  all: ['users'],
  current: () => [...USER_KEYS.all, 'current'],
  applications: (userId) => [...USER_KEYS.all, 'applications', userId],
  tasks: (userId) => [...USER_KEYS.all, 'tasks', userId],
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: USER_KEYS.current(),
    queryFn: async () => {
      return await apiClient.get('/auth/me');
    },
    retry: false, // Don't retry auth requests
  });
};

// Get talent applications
export const useTalentApplications = (talentId) => {
  return useQuery({
    queryKey: USER_KEYS.applications(talentId),
    queryFn: async () => {
      if (!talentId) throw new Error('Talent ID is required');
      
      // For static frontend, return mock data
      console.log('Fetching applications for talent:', talentId);
      const mockApplications = mockUtils.mockTalentApplications(talentId);
      
      return {
        success: true,
        data: mockApplications
      };
    },
    enabled: !!talentId,
  });
};

// Get user's posted tasks
export const useUserTasks = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: USER_KEYS.tasks(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await apiClient.get(`/users/${userId}/tasks`, { page, limit });
    },
    enabled: !!userId,
  });
};

// Check if user exists
export const useCheckUserExists = () => {
  return useMutation({
    mutationFn: async ({ email, role }) => {
      if (!email) throw new Error('Email is required');
      
      // For static frontend, mock the response
      console.log(`Checking if ${email} exists as ${role}`);
      return {
        exists: false,
        message: 'User does not exist'
      };
    },
  });
};

// Register user mutation
export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userData, role }) => {
      // For static frontend, simulate API response
      console.log('Registering new', role, 'with data:', userData);
      
      const mockToken = mockUtils.generateMockToken();
      const userId = mockUtils.generateMockUserId(role);
      
      const registeredUser = {
        ...userData,
        id: userId,
        token: mockToken,
        success: true
      };
      
      localStorage.setItem('token', mockToken);
      return registeredUser;
    },
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() });
    },
  });
};

// Login user mutation
export const useLoginUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ credentials, role }) => {
      // For static frontend, simulate API response
      console.log('Login attempt for', credentials.email, 'as', role);
      
      const mockToken = mockUtils.generateMockToken();
      const mockRefreshToken = 'mock-refresh-token-' + Math.random().toString(36).substring(2);
      
      let userData;
      if (role === 'talent' && credentials.email === 'ali.hassan@example.com') {
        userData = {
          id: 'talent1',
          email: 'ali.hassan@example.com',
          name: 'Ali Hassan',
          given_name: 'Ali',
          family_name: 'Hassan',
          picture: 'https://randomuser.me/api/portraits/men/5.jpg',
          role: 'talent',
          token: mockToken,
          refreshToken: mockRefreshToken,
          accessTokenExpires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          profileCompleted: true,
          success: true
        };
      } else {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('refreshToken', mockRefreshToken);
      return userData;
    },
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Call backend logout API if available (non-mocked)
      if (!process.env.REACT_APP_USE_MOCK_DATA) {
        const token = localStorage.getItem('token');
        if (token) {
          await apiClient.post('/api/auth/logout');
        }
      }
      
      // Clear all auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return { success: true };
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Complete profile mutation
export const useCompleteProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, profileData }) => {
      console.log('Completing profile for user:', userId);
      console.log('Profile data:', profileData);
      
      const mockToken = mockUtils.generateMockToken();
      
      // Get existing user from localStorage if available
      let existingUser = {};
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          existingUser = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
      
      // Create updated user object
      const updatedUser = {
        ...existingUser,
        id: userId,
        profileCompleted: true,
        bio: profileData.get('bio') || 'Professional with experience in various tasks',
        skills: profileData.get('skills') ? JSON.parse(profileData.get('skills')) : ['Plumbing', 'Home Repair'],
        hourlyRate: profileData.get('hourlyRate') || 2500,
        education: profileData.get('education') || 'Bachelor\'s Degree',
        location: profileData.get('location') || 'Lahore, Pakistan',
        token: mockToken,
        success: true
      };
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Profile completed successfully:', updatedUser);
      return updatedUser;
    },
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() });
    },
  });
};

// Google Auth mutation
export const useGoogleAuth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tokenResponse, role }) => {
      console.log('Google Auth with token', tokenResponse, 'for role', role);
      return mockUtils.mockGoogleAuth(tokenResponse, role);
    },
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() });
    },
  });
};
