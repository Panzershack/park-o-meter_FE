import React, { useState, useEffect } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";

// Google Maps Script Loader Component
export const GoogleMapsLoader = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);

  useEffect(() => {
    // Function to load Google Maps script
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setIsScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        setIsScriptLoaded(true);
      };

      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
        setScriptError(error);
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    };

    loadGoogleMapsScript();
  }, []);

  if (scriptError) {
    return (
      <div>
        Error loading Google Maps. Please check your internet connection and API key.
      </div>
    );
  }

  if (!isScriptLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        Loading maps...
      </div>
    );
  }

  return <>{children}</>;
};

// Wrapper component for navigation view
export const NavigationViewWrapper = ({ destination, onClose }) => {
  return (
    <GoogleMapsLoader>
      <SimplifiedNavigationView 
        destination={destination} 
        onClose={onClose} 
      />
    </GoogleMapsLoader>
  );
};