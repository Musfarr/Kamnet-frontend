import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient';

// Query keys for map
export const MAP_KEYS = {
  all: ['map'],
  markers: (city) => [...MAP_KEYS.all, 'markers', city],
};

// Get map markers
export const useMapMarkers = (city = '') => {
  return useQuery({
    queryKey: MAP_KEYS.markers(city),
    queryFn: async () => {
      const params = {};
      if (city) params.city = city;
      
      return await apiClient.get('/markers', params);
    },
  });
};
