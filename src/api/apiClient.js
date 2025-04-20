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
  // Check if user exists by email
  async checkUserExists(email, role) {
    if (!email) throw new Error('Email is required');
    
    try {
      const response = await api.get(`/${role}s/check-email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  },
  
  // Register new user
  async registerUser(userData, role) {
    try {
      const response = await api.post(`/auth/register/${role}`, userData);
      
      // Save token to localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Login user
  async loginUser(credentials, role) {
    try {
      const response = await api.post(`/auth/login/${role}`, credentials);
      
      // Save token to localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
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
  
  // Complete talent profile
  async completeProfile(userId, profileData) {
    try {
      const response = await api.put(`/talents/${userId}/complete-profile`, profileData);
      
      // Clear user cache to reflect updated profile
      cache.data.delete('current-user');
      
      return response.data;
    } catch (error) {
      console.error('Error completing profile:', error);
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
  
  // Get talent's applications
  async getTalentApplications(talentId, page = 1, limit = 10) {
    try {
      const cacheKey = `talent-applications-${talentId}-${page}-${limit}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await api.get(`/talents/${talentId}/applications?page=${page}&limit=${limit}`);
      
      // Cache the results
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching talent applications:', error);
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

// Google authentication
export const googleAuth = async (tokenResponse, role) => {
  try {
    const response = await api.post('/auth/google', {
      ...tokenResponse,
      role
    });
    
    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
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
