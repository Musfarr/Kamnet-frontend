import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient';
import { normalizeMarker } from '../utils/normalize';

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
      const res = await apiClient.get('/map/markers', params);
      const list = Array.isArray(res) ? res : (res?.data ?? []);

      const markers = list.map((m) => {
        const n = normalizeMarker(m);
        const latitude = n.latitude ?? n.position?.lat ?? n.lat ?? n.coordinates?.lat;
        const longitude = n.longitude ?? n.position?.lng ?? n.lng ?? n.coordinates?.lng;
        return {
          id: n.id || n._id,
          latitude,
          longitude,
          title: n.title,
          category: n.category,
          price: n.price,
        };
      }).filter((m) => typeof m.latitude === 'number' && typeof m.longitude === 'number');

      return markers;
    },
  });
};
