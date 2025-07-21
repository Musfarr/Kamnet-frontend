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

// Add token to requests if available and handle token refresh
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

// Handle 401 responses (token expired) by attempting to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, user needs to log in again
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Redirect to login or dispatch logout action
          window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken
        });
        
        if (response.data.success) {
          // Store the new token
          localStorage.setItem('token', response.data.token);
          
          // Update the original request authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Clear all auth tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Notify app about auth expiry
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic HTTP methods for API calls
export const apiClient = {
  // GET request
  async get(endpoint, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  // POST request
  async post(endpoint, data = {}) {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  // PUT request
  async put(endpoint, data = {}) {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  // PATCH request
  async patch(endpoint, data = {}) {
    try {
      const response = await api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }
};

// Mock data utilities for static frontend
export const mockUtils = {
  // Generate mock token
  generateMockToken() {
    return 'mock-jwt-token-' + Math.random().toString(36).substring(2);
  },

  // Generate mock user ID
  generateMockUserId(role) {
    return role + '-' + Math.random().toString(36).substring(2);
  },

  // Mock Google Auth response
  mockGoogleAuth(tokenResponse, role) {
    const mockToken = this.generateMockToken();
    
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
    
    localStorage.setItem('token', mockToken);
    return userData;
  },

  // Mock talent applications
  mockTalentApplications(talentId) {
    return [
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
  }
};

// Export the main API client as default
export default apiClient;
