import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
        const response = await api.post(`/auth/refresh-token`, {
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

// Extended methods where headers/status are needed
export const apiClientMeta = {
  // GET request returning data and headers
  async getWithMeta(endpoint, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const response = await api.get(url);
      return { data: response.data, headers: response.headers, status: response.status };
    } catch (error) {
      console.error(`GET (meta) ${endpoint} failed:`, error);
      throw error;
    }
  }
};


// Export the main API client as default
export default apiClient;
