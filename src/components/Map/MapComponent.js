import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../api/apiClient';

// Replace with your Mapbox token from .env file
// IMPORTANT: In a real application, you should use an environment variable
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

const MapComponent = ({ center = [-74.0060, 40.7128], markers = [], zoom = 10, height = '100%' }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markerPopups, setMarkerPopups] = useState({});
  const [mapError, setMapError] = useState('');
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Map already initialized

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right');

      // Set up event handlers
      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          Object.values(markerPopups).forEach(popup => popup.remove());
          map.current.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please check your internet connection.');
    }
  }, []);

  // Add markers when map is loaded and markers change
  useEffect(() => {
    if (!map.current || !mapLoaded || !markers.length) return;

    try {
      // Clean up existing popups
      Object.values(markerPopups).forEach(popup => popup.remove());
      
      // Create new markers and popups
      const newMarkerPopups = {};
      markers.forEach(marker => {
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'marker-popup';
        popupContent.innerHTML = `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px;">${marker.title}</h3>
            ${marker.category ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Category:</strong> ${marker.category}</p>` : ''}
            ${marker.price ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Price:</strong> $${marker.price}</p>` : ''}
            <button id="view-task-${marker.id}" style="background-color: #1976d2; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px; font-size: 14px;">View Task</button>
          </div>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          maxWidth: '300px'
        }).setDOMContent(popupContent);
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = 'url(/marker-icon.png)';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundSize = '100%';
        el.style.cursor = 'pointer';
        
        // Add marker to map with popup
        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .setPopup(popup)
          .addTo(map.current);
        
        // Store popup reference for cleanup
        newMarkerPopups[marker.id] = popup;
        
        // Add event listener to the view task button after popup is opened
        mapboxMarker.getElement().addEventListener('click', () => {
          setTimeout(() => {
            const button = document.getElementById(`view-task-${marker.id}`);
            if (button) {
              button.addEventListener('click', (e) => {
                e.stopPropagation();
                navigate(`/tasks/${marker.id}`);
              });
            }
          }, 10);
        });
      });
      
      setMarkerPopups(newMarkerPopups);
      
      // Fit bounds to markers if more than one marker
      if (markers.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => {
          bounds.extend([marker.longitude, marker.latitude]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }, [mapLoaded, markers, navigate]);

  return (
    <Box sx={{ width: '100%', height: height, position: 'relative' }}>
      {mapError && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 10,
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography color="error">{mapError}</Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </Paper>
      )}
      
      {!mapLoaded && !mapError && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 10 
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        aria-label="Map of task locations"
      />
    </Box>
  );
};

export default MapComponent;
