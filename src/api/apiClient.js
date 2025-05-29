import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create an axios instance with default configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple cache implementation to reduce repeated API calls
const cache = {
  data: new Map(),
  ttl: 60000, // 1 minute cache lifetime
  set(key, value) {
    this.data.set(key, {
      value,
      timestamp: Date.now(),
    });
  },
  get(key) {
    const cached = this.data.get(key);
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.ttl) {
      this.data.delete(key);
      return null;
    }
    
    return cached.value;
  },
  clear() {
    this.data.clear();
  }
};

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Task related API calls
export const taskApi = {
  // Get all tasks with pagination and filtering
  async getTasks(params = {}) {
    try {
      // Build the cache key based on the params
      const cacheKey = `tasks-${JSON.stringify(params)}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // Default pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('_page', page);
      queryParams.append('_limit', limit);
      
      // Add other filters if provided
      if (params.category) queryParams.append('category', params.category);
      if (params.location) queryParams.append('location', params.location);
      if (params.search) queryParams.append('q', params.search);
      
      const response = await api.get(`/tasks?${queryParams.toString()}`);
      
      // Extract total count from headers
      const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
      
      const result = {
        data: response.data,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
      
      // Cache the results
      cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  // Get featured tasks (limited to 3)
  async getFeaturedTasks() {
    try {
      const cacheKey = 'featured-tasks';
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await api.get('/tasks?_limit=3');
      
      // Cache the results
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching featured tasks:', error);
      throw error;
    }
  },
  
  // Get a single task by ID
  async getTaskById(id) {
    if (!id) throw new Error('Task ID is required');
    
    try {
      const cacheKey = `task-${id}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await api.get(`/tasks/${id}`);
      
      // Cache the result
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new task
  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  // Apply for a task
  async applyForTask(taskId, applicationData) {
    try {
      const response = await api.post(`/tasks/${taskId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for task:', error);
      throw error;
    }
  }
};

// User related API calls
export const userApi = {
  // Check if user exists by email - Mocked for static frontend
  async checkUserExists(email, role) {
    if (!email) throw new Error('Email is required');
    
    try {
      // For static frontend, we'll mock the response
      console.log(`Checking if ${email} exists as ${role}`);
      
      // Mock response - always return not exists for now
      return {
        exists: false,
        message: 'User does not exist'
      };
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  },
  
  // Register new user - Mocked for static frontend
  async registerUser(userData, role) {
    try {
      // For static frontend, simulate API response with local data
      console.log('Registering new', role, 'with data:', userData);
      
      // Generate a mock token
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Create a user ID
      const userId = role + '-' + Math.random().toString(36).substring(2);
      
      // Return mock user data with token
      const registeredUser = {
        ...userData,
        id: userId,
        token: mockToken,
        success: true
      };
      
      // Save token to localStorage
      localStorage.setItem('token', mockToken);
      
      return registeredUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Login user - Mocked for static frontend
  async loginUser(credentials, role) {
    try {
      // For static frontend, simulate API response with local data
      console.log('Login attempt for', credentials.email, 'as', role);
      
      // Generate a mock token
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Mock user data based on role
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
          profileCompleted: true,
          success: true
        };
      } else {
        // Return error for unknown users
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }
      
      // Save token to localStorage
      localStorage.setItem('token', mockToken);
      
      return userData;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('token');
  },
  
  // Get current user profile
  async getCurrentUser() {
    try {
      const cacheKey = 'current-user';
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await api.get('/auth/me');
      
      // Cache the result
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  // Complete talent profile - Mocked for static frontend
  async completeProfile(userId, profileData) {
    try {
      console.log('Completing profile for user:', userId);
      console.log('Profile data:', profileData);
      
      // For static frontend, we'll mock the response
      // Create a mock updated user with completed profile
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
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
      
      // Update localStorage with the updated user data
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Clear user cache to reflect updated profile
      cache.data.delete('current-user');
      
      console.log('Profile completed successfully:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error completing profile:', error);
      throw error;
    }
  },
  
  // Get talent's applications - Mocked for static frontend
  async getTalentApplications(talentId) {
    try {
      console.log('Fetching applications for talent:', talentId);
      
      // For static frontend, return mock applications data
      const mockApplications = [
        {
          id: 'app1',
          taskId: 'task1',
          talentId: talentId,
          status: 'pending',
          coverLetter: 'I am interested in this task and have relevant experience.',
          proposedRate: 2500,
          createdAt: '2025-05-28T10:30:00Z',
          task: {
            id: 'task1',
            title: 'Plumbing Repair in Lahore',
            description: 'Need help fixing a leaky faucet and installing a new sink.',
            budget: 5000,
            location: 'Lahore, Pakistan',
            dueDate: '2025-06-15',
            category: 'Plumbing',
            status: 'open',
            postedBy: {
              id: 'user1',
              name: 'Ahmed Khan',
              picture: 'https://randomuser.me/api/portraits/men/1.jpg'
            }
          }
        },
        {
          id: 'app2',
          taskId: 'task2',
          talentId: talentId,
          status: 'accepted',
          coverLetter: 'I have done similar work before and can complete this quickly.',
          proposedRate: 3000,
          createdAt: '2025-05-25T14:20:00Z',
          task: {
            id: 'task2',
            title: 'Home Cleaning in Karachi',
            description: 'Need thorough cleaning of a 3-bedroom apartment.',
            budget: 4000,
            location: 'Karachi, Pakistan',
            dueDate: '2025-06-05',
            category: 'Cleaning',
            status: 'assigned',
            postedBy: {
              id: 'user2',
              name: 'Fatima Ali',
              picture: 'https://randomuser.me/api/portraits/women/2.jpg'
            }
          }
        }
      ];
      
      console.log('Returning mock applications:', mockApplications);
      
      return {
        success: true,
        data: mockApplications
      };
    } catch (error) {
      console.error('Error fetching talent applications:', error);
      throw error;
    }
  },
  
  // Get user's posted tasks
  async getUserTasks(userId, page = 1, limit = 10) {
    try {
      const cacheKey = `user-tasks-${userId}-${page}-${limit}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await api.get(`/users/${userId}/tasks?page=${page}&limit=${limit}`);
      
      // Cache the results
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  },
  
  // Get applications for a task
  async getTaskApplications(taskId) {
    try {
      const response = await api.get(`/tasks/${taskId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task applications:', error);
      throw error;
    }
  }
};

// Map related API calls
export const mapApi = {
  // Get all map markers
  async getMarkers(city = '') {
    try {
      const cacheKey = `markers-${city}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const queryParams = new URLSearchParams();
      if (city) queryParams.append('city', city);
      
      const response = await api.get(`/markers?${queryParams.toString()}`);
      
      // Cache the results
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching map markers:', error);
      throw error;
    }
  }
};

// Google authentication - Mocked for static frontend
export const googleAuth = async (tokenResponse, role) => {
  try {
    // For static frontend, simulate API response with local data
    // This would normally communicate with a backend server
    console.log('Google Auth with token', tokenResponse, 'for role', role);
    
    // Generate a mock token
    const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    // Create mock user data based on role
    let userData;
    if (role === 'user') {
      userData = {
        id: 'user1',
        email: 'ahmad.khan@example.com',
        name: 'Ahmad Khan',
        given_name: 'Ahmad',
        family_name: 'Khan',
        picture: 'https://randomuser.me/api/portraits/men/1.jpg',
        role: 'user',
        token: mockToken,
        profileCompleted: true,
        success: true
      };
    } else {
      userData = {
        id: 'talent1',
        email: 'ali.hassan@example.com',
        name: 'Ali Hassan',
        given_name: 'Ali',
        family_name: 'Hassan',
        picture: 'https://randomuser.me/api/portraits/men/5.jpg',
        role: 'talent',
        token: mockToken,
        profileCompleted: true,
        success: true
      };
    }
    
    // Save token to localStorage
    localStorage.setItem('token', mockToken);
    
    return userData;
  } catch (error) {
    console.error('Error authenticating with Google:', error);
    throw error;
  }
};

// Method to clear all cache when needed
export const clearApiCache = () => {
  cache.clear();
};

export default { taskApi, userApi, mapApi, googleAuth, clearApiCache };
