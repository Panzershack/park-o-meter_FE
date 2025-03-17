import "../../styles/global.css";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import {
  Box,
  Typography,
  Drawer,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputAdornment,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Paper
} from "@mui/material";
import { 
  LocalParking, 
  LocationOn, 
  EventAvailable, 
  AttachMoney, 
  ChevronRight,
  ChevronLeft
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const mapOptions = {
  mapId: import.meta.env.VITE_PUBLIC_MAP_ID,
  center: { lat: 51.750576, lng: -0.236069 },
  zoom: 18,
  disableDefaultUI: false,
  heading: 0,
  tilt: 0,
};

const spotTypes = [
  { id: 'outdoor', label: 'Outdoor Parking Spot', priceMultiplier: 1.0 },
  { id: 'covered', label: 'Covered Parking Spot', priceMultiplier: 1.5 },
  { id: 'garage', label: 'Garage', priceMultiplier: 2.0 },
  { id: 'secure', label: 'Secure Parking (with CCTV)', priceMultiplier: 1.8 }
];

const steps = ['Select Location', 'Spot Details', 'Set Availability', 'Review & Submit'];

export default function ListParkingPage() {
  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <ListParkingMap />
    </Wrapper>
  );
}

function ListParkingMap() {
  const { currentUser } = useAuth(); //current user definition
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    description: '',
    spotType: 'outdoor',
    area: {
      width: 2.4,
      length: 4.8
    },
    availability: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    },
    price: {
      hourly: 1,
      daily: 12
    }
  });
  
  const ref = useRef(null);

  // Initialize map
  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, mapOptions);
      setMap(newMap);
      
      // Add click listener to map
      newMap.addListener("click", (event) => {
        // Remove existing marker if any
        if (marker) {
          marker.setMap(null);
        }
        
        // Create new marker at clicked position
        const newMarker = new google.maps.Marker({
          position: event.latLng,
          map: newMap,
          animation: google.maps.Animation.DROP,
          draggable: true,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }
        });
        
        // Get address from coordinates
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            
            setSelectedLocation({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
              address: address
            });
            
            setFormData(prev => ({
              ...prev,
              address: address
            }));
          }
        });
        
        // Add drag end listener to marker
        newMarker.addListener("dragend", () => {
          const position = newMarker.getPosition();
          const geocoder = new google.maps.Geocoder();
          
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK" && results[0]) {
              const address = results[0].formatted_address;
              
              setSelectedLocation({
                lat: position.lat(),
                lng: position.lng(),
                address: address
              });
              
              setFormData(prev => ({
                ...prev,
                address: address
              }));
            }
          });
        });
        
        setMarker(newMarker);
        setDrawerOpen(true);
      });
    }
  }, [map, marker]);

  // Calculate price based on area and spot type
  useEffect(() => {
    const { width, length } = formData.area;
    const area = width * length;
    const baseHourlyPrice = 1; // £1 per hour for standard size
    const baseDailyPrice = 12; // £12 per day for standard size
    
    // Calculate area ratio (compared to standard 2.4m x 4.8m = 11.52m²)
    const areaRatio = area / 11.52;
    
    // Get price multiplier based on spot type
    const spotType = spotTypes.find(type => type.id === formData.spotType);
    const typeMultiplier = spotType ? spotType.priceMultiplier : 1;
    
    // Calculate final prices
    const hourlyPrice = Math.round(baseHourlyPrice * areaRatio * typeMultiplier * 2) / 2; // Round to nearest £0.50
    const dailyPrice = Math.round(baseDailyPrice * areaRatio * typeMultiplier);
    
    setFormData(prev => ({
      ...prev,
      price: {
        hourly: hourlyPrice,
        daily: dailyPrice
      }
    }));
  }, [formData.area, formData.spotType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects in state
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [name]: date
      }
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Create JSON object for submission
    const listingData = {
      location: {
        type: "Point",
        coordinates: [selectedLocation.lng, selectedLocation.lat]
      },
      address: selectedLocation.address,
      title: formData.title,
      description: formData.description,
      spotType: formData.spotType,
      dimensions: {
        width: parseFloat(formData.area.width),
        length: parseFloat(formData.area.length)
      },
      availability: {
        startDate: formData.availability.startDate,
        endDate: formData.availability.endDate
      },
      pricing: {
        hourly: formData.price.hourly,
        daily: formData.price.daily
      },
      owner: {
        name: currentUser.email,
        id: currentUser.uid
      },
      createdAt: new Date()
    };
    
    // Log the JSON data for backend integration
    console.log("Listing Data for MongoDB:", JSON.stringify(listingData, null, 2));
    
    try {
      const response = await fetch("http://localhost:5001/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(listingData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Listing saved:", data);
      setSnackbarOpen(true);
      // Optionally reset form or redirect after success:
      setDrawerOpen(false);
      setActiveStep(0);
    } catch (error) {
      console.error("Error submitting listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different drawer content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2973B2' }}>
              Selected Location
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
              <LocationOn color="secondary" sx={{ mt: 0.5, mr: 1 }} />
              <Typography variant="body1">{selectedLocation?.address || 'No location selected'}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You can drag the marker to adjust the exact location of your parking spot.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                endIcon={<ChevronRight />}
                onClick={handleNext}
                sx={{
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  }
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#2973B2' }}>
              Parking Spot Details
            </Typography>
            
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              placeholder="e.g., Convenient Parking Near City Center"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Provide details about your parking spot..."
              required
            />
            
            <FormControl component="fieldset" sx={{ my: 2 }} fullWidth>
              <FormLabel component="legend" sx={{ color: '#2973B2' }}>Parking Spot Type</FormLabel>
              <RadioGroup 
                name="spotType" 
                value={formData.spotType} 
                onChange={handleInputChange}
                sx={{ mt: 1 }}
              >
                {spotTypes.map((type) => (
                  <FormControlLabel 
                    key={type.id} 
                    value={type.id} 
                    control={<Radio />} 
                    label={type.label} 
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: '#2973B2' }}>
              Parking Spot Dimensions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Width (m)"
                  name="area.width"
                  type="number"
                  value={formData.area.width}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                  inputProps={{ step: 0.1, min: 1.5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Length (m)"
                  name="area.length"
                  type="number"
                  value={formData.area.length}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                  inputProps={{ step: 0.1, min: 2.5 }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                startIcon={<ChevronLeft />}
                onClick={handleBack}
                sx={{ borderColor: '#48A6A7', color: '#48A6A7' }}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                endIcon={<ChevronRight />}
                onClick={handleNext}
                sx={{
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  }
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#2973B2' }}>
              Set Availability
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Available From</Typography>
                <DatePicker
                  value={formData.availability.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Available Until</Typography>
                <DatePicker
                  value={formData.availability.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={formData.availability.startDate}
                />
              </Box>
            </LocalizationProvider>
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, color: '#2973B2' }}>
              Pricing (Automatically Calculated)
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate"
                  value={formData.price.hourly}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Daily Rate"
                  value={formData.price.daily}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Prices are calculated based on spot size and type. Standard size (2.4m x 4.8m) outdoor parking starts at £1/hour and £12/day.
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                startIcon={<ChevronLeft />}
                onClick={handleBack}
                sx={{ borderColor: '#48A6A7', color: '#48A6A7' }}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                endIcon={<ChevronRight />}
                onClick={handleNext}
                sx={{
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  }
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#2973B2' }}>
              Review & Submit
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2973B2' }}>
                {formData.title || 'Untitled Parking Spot'}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn color="secondary" sx={{ mt: 0.5, mr: 1 }} />
                <Typography variant="body2">{selectedLocation?.address}</Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                {formData.description || 'No description provided.'}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Spot Type:
                </Typography>
                <Typography variant="body2">
                  {spotTypes.find(type => type.id === formData.spotType)?.label}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Dimensions:
                </Typography>
                <Typography variant="body2">
                  {formData.area.width}m x {formData.area.length}m
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Available:
                </Typography>
                <Typography variant="body2">
                  {formData.availability.startDate.toLocaleDateString()} to {formData.availability.endDate.toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Pricing:
                </Typography>
                <Typography variant="body2">
                  £{formData.price.hourly}/hour · £{formData.price.daily}/day
                </Typography>
              </Box>
            </Paper>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              By submitting, you confirm that you own or have permission to list this parking spot and agree to our terms and conditions.
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                startIcon={<ChevronLeft />}
                onClick={handleBack}
                sx={{ borderColor: '#48A6A7', color: '#48A6A7' }}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  }
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Submit Listing'
                )}
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Instructions overlay */}
      {!drawerOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            textAlign: 'center',
            maxWidth: 500
          }}
        >
          <Typography variant="h6" sx={{ color: '#2973B2', mb: 1 }}>
            <LocalParking sx={{ mr: 1, verticalAlign: 'middle' }} />
            Select Your Parking Spot Location
          </Typography>
          <Typography variant="body2">
            Click on the map to place a marker at your parking spot location. You can drag the marker to adjust it.
          </Typography>
        </Box>
      )}

      {/* Map ref */}
      <div ref={ref} id="map" style={{ height: '100vh', width: '100%' }} />

      {/* Form drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          if (!isSubmitting) {
            setDrawerOpen(false);
            setActiveStep(0);
            if (marker) {
              marker.setMap(null);
              setMarker(null);
            }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 450 },
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ p: 2, bgcolor: '#2973B2', color: 'white' }}>
            <Typography variant="h6">List Your Parking Spot</Typography>
          </Box>
          
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 2, px: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {getStepContent(activeStep)}
        </Box>
      </Drawer>
      
      {/* Success snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Your parking spot has been successfully listed!
        </Alert>
      </Snackbar>
    </Box>
  );
}
