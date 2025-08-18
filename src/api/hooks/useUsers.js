import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../apiClient';
import { normalizeTasks } from '../utils/normalize';

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
      
      const response = await apiClient.get(`/applications/talent/${talentId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch applications');
      }
      
      return response.data || [];
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
      const response = await apiClient.get(`/tasks/me`, { page, limit });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user tasks');
      }
      
      const list = response.data || [];
      return normalizeTasks(list);
    },
    enabled: !!userId,
  });
};

// Check if user exists
export const useCheckUserExists = () => {
  return useMutation({
    mutationFn: async ({ email, role }) => {
      if (!email) throw new Error('Email is required');
      
      const response = await apiClient.post('/auth/check-user', { email, role });
      return response;
    },
  });
};

// Register user mutation
export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userData, role }) => {
      const response = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: role
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      // Store tokens
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response.user;
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
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Store tokens
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response.user;
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
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
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
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to complete profile');
      }
      
      return response.data;
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
      const response = await apiClient.post('/auth/google', {
        token: tokenResponse.credential,
        role: role
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Google authentication failed');
      }
      
      // Store tokens
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response.user;
    },
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() });
    },
  });
};
