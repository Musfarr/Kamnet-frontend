import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiClientMeta } from '../apiClient';
import { normalizeTasks, normalizeTask, mapCreateTaskPayload, mapApplyPayload } from '../utils/normalize';

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
        page: params.page || 1,
        limit: params.limit || 10,
      };
      
      // Add filters if provided
      if (params.category) queryParams.category = params.category;
      if (params.location) queryParams.location = params.location;
      if (params.search) queryParams.search = params.search;
      
      const response = await apiClient.get('/tasks', queryParams);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
      
      const list = response.data || [];
      const normalized = normalizeTasks(list);
      
      // Get pagination info from response
      const totalCount = response.count || normalized.length;
      const currentPage = params.page || 1;
      const limit = params.limit || 10;
      const totalPages = response.pagination?.totalPages || Math.ceil(totalCount / limit);
      
      return {
        data: normalized,
        totalCount,
        currentPage,
        totalPages,
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
      const response = await apiClient.get('/tasks', { limit: 6, sort: '-createdAt' });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch featured tasks');
      }
      
      const list = response.data || [];
      return normalizeTasks(list);
    },
  });
};

// Get single task by ID
export const useTask = (id) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Task ID is required');
      const response = await apiClient.get(`/tasks/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Task not found');
      }
      
      return normalizeTask(response.data);
    },
    enabled: !!id,
  });
};

// Create new task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData) => {
      const payload = mapCreateTaskPayload(taskData);
      return await apiClient.post('/tasks', payload);
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
      const payload = mapApplyPayload(applicationData);
      return await apiClient.post(`/applications`, { ...payload, task: taskId });
    },
    onSuccess: (data, variables) => {
      // Invalidate task details to reflect new application
      queryClient.invalidateQueries({ 
        queryKey: TASK_KEYS.detail(variables.taskId) 
      });
    },
  });
};
