import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, mockUtils } from '../apiClient';

// Query keys for tasks
export const TASK_KEYS = {
  all: ['tasks'],
  lists: () => [...TASK_KEYS.all, 'list'],
  list: (filters) => [...TASK_KEYS.lists(), filters],
  details: () => [...TASK_KEYS.all, 'detail'],
  detail: (id) => [...TASK_KEYS.details(), id],
  featured: () => [...TASK_KEYS.all, 'featured'],
};

// Get all tasks with pagination and filtering
export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: TASK_KEYS.list(params),
    queryFn: async () => {
      // Build query parameters
      const queryParams = {
        _page: params.page || 1,
        _limit: params.limit || 10,
      };
      
      // Add filters if provided
      if (params.category) queryParams.category = params.category;
      if (params.location) queryParams.location = params.location;
      if (params.search) queryParams.q = params.search;
      
      const response = await apiClient.get('/tasks', queryParams);
      
      // For mock data, simulate pagination response
      const totalCount = response.length || 0;
      const currentPage = params.page || 1;
      const limit = params.limit || 10;
      
      return {
        data: response,
        totalCount,
        currentPage,
        totalPages: Math.ceil(totalCount / limit),
      };
    },
    enabled: true,
  });
};

// Get featured tasks
export const useFeaturedTasks = () => {
  return useQuery({
    queryKey: TASK_KEYS.featured(),
    queryFn: async () => {
      return await apiClient.get('/tasks', { _limit: 3 });
    },
  });
};

// Get single task by ID
export const useTask = (id) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Task ID is required');
      return await apiClient.get(`/tasks/${id}`);
    },
    enabled: !!id,
  });
};

// Create new task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData) => {
      return await apiClient.post('/tasks', taskData);
    },
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.featured() });
    },
  });
};

// Apply for task mutation
export const useApplyForTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, applicationData }) => {
      return await apiClient.post(`/tasks/${taskId}/apply`, applicationData);
    },
    onSuccess: (data, variables) => {
      // Invalidate task details to reflect new application
      queryClient.invalidateQueries({ 
        queryKey: TASK_KEYS.detail(variables.taskId) 
      });
    },
  });
};
