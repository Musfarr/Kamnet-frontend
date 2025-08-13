import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiClientMeta, mockUtils } from '../apiClient';
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
        _page: params.page || 1,
        _limit: params.limit || 10,
      };
      
      // Add filters if provided
      if (params.category) queryParams.category = params.category;
      if (params.location) queryParams.location = params.location;
      if (params.search) queryParams.q = params.search;
      
      const { data, headers } = await apiClientMeta.getWithMeta('/tasks', queryParams);
      // Unwrap possible { success, data }
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      const normalized = normalizeTasks(list);
      
      // Read total count from header if available
      const totalCountHeader = headers?.['x-total-count'] || headers?.['X-Total-Count'];
      const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : normalized.length;
      const currentPage = params.page || 1;
      const limit = params.limit || 10;
      
      return {
        data: normalized,
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
      const res = await apiClient.get('/tasks/featured');
      const list = Array.isArray(res) ? res : (res?.data ?? []);
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
      const res = await apiClient.get(`/tasks/${id}`);
      const raw = (res && typeof res === 'object' && !Array.isArray(res) && 'data' in res) ? res.data : res;
      return normalizeTask(raw);
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
      return await apiClient.post(`/frontend/tasks/${taskId}/apply`, payload);
    },
    onSuccess: (data, variables) => {
      // Invalidate task details to reflect new application
      queryClient.invalidateQueries({ 
        queryKey: TASK_KEYS.detail(variables.taskId) 
      });
    },
  });
};
