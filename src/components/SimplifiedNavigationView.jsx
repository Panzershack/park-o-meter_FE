import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
} from '@mui/icons-material';

export default function SimplifiedNavigationView({ destination, onClose }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Validate and extract coordinates
  const getValidCoordinates = () => {
    if (!destination?.location) return null;
    
    const coords = destination.location.coordinates || destination.location;
    
    if (Array.isArray(coords) && 
        coords.length === 2 && 
        !isNaN(coords[0]) && 
        !isNaN(coords[1]) && 
        coords[0] >= -180 && coords[0] <= 180 && 
        coords[1] >= -90 && coords[1] <= 90) {
      return {
        lat: coords[1],
        lng: coords[0]
      };
    }
    
    return null;
  };

  // Initialize map and directions
  useEffect(() => {
    // Ensure Google Maps and coordinates are available
    if (!window.google || !window.google.maps) {
      setError("Google Maps API not loaded");
      setLoading(false);
      return;
    }

    const destinationCoords = getValidCoordinates();
    if (!destinationCoords) {
      setError("Invalid destination coordinates");
      setLoading(false);
      return;
    }

    // Get current location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Initialize map
          const map = new window.google.maps.Map(mapRef.current, {
            center: currentPos,
            zoom: 12,
            mapTypeControl: false,
          });

          // Add markers
          new window.google.maps.Marker({
            position: currentPos,
            map: map,
            title: 'Your Location',
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          });

          new window.google.maps.Marker({
            position: destinationCoords,
            map: map,
            title: destination.title || 'Destination',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });

          // Calculate and display directions
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            polylineOptions: {
              strokeColor: '#48A6A7',
              strokeWeight: 6
            }
          });

          directionsService.route(
            {
              origin: currentPos,
              destination: destinationCoords,
              travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === "OK") {
                directionsRenderer.setDirections(result);
              } else {
                console.error(`Directions request failed due to ${status}`);
              }
              setLoading(false);
            }
          );
        },
        (error) => {
          setError(`Geolocation error: ${error.message}`);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, [destination]);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#48A6A7', mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Calculating your route...
        </Typography>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<ArrowBack />}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 500 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={onClose}
          startIcon={<ArrowBack />}
          sx={{
            bgcolor: '#48A6A7',
            '&:hover': {
              bgcolor: '#2973B2',
            }
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  // Render map
  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <Button
          variant="contained"
          onClick={onClose}
          startIcon={<ArrowBack />}
          sx={{
            bgcolor: 'white',
            color: '#2973B2',
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
            boxShadow: 3
          }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
}