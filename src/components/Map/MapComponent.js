import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Component to handle map center changes based on external events
function MapCenterUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
    
    // Listen for custom center-map event
    const handleCenterMap = (event) => {
      const { lat, lng, zoom } = event.detail;
      if (lat && lng) {
        map.setView([lat, lng], zoom || 14);
      }
    };
    
    window.addEventListener('center-map', handleCenterMap);
    
    return () => {
      window.removeEventListener('center-map', handleCenterMap);
    };
  }, [map]);
  
  return null;
}

const MapComponent = ({ center = [40.7128, -74.0060], markers = [], zoom = 10, height = '100%' }) => {
  const [mapError, setMapError] = useState('');
  const navigate = useNavigate();
  
  // Convert center from [lng, lat] to [lat, lng] format that Leaflet expects
  const leafletCenter = [center[0], center[1]];
  
  // Create custom marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Handle task click from marker
  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <Box sx={{ width: '100%', height: height, position: 'relative' }}>
      {mapError && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 999,
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
      
      <MapContainer 
        center={leafletCenter} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterUpdater center={leafletCenter} zoom={zoom} />
        
        {markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={[marker.latitude, marker.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ padding: '5px', maxWidth: '200px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{marker.title}</h3>
                {marker.category && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Category:</strong> {marker.category}
                  </p>
                )}
                {marker.price && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Price:</strong> Rs. {marker.price}
                  </p>
                )}
                <button 
                  style={{ 
                    backgroundColor: '#1976d2', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    marginTop: '5px', 
                    fontSize: '14px'
                  }}
                  onClick={() => handleTaskClick(marker.id)}
                >
                  View Task
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default MapComponent;
