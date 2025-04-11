import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Rating
} from '@mui/material';
import { 
  Close, 
  LocationOn, 
  DirectionsCar, 
  AttachMoney, 
  CalendarToday, 
  AccessTime,
  Phone,
  Email,
  NavigationOutlined
} from '@mui/icons-material';

// Import simplified NavigationView component
import SimplifiedNavigationView from '../components/SimplifiedNavigationView';

const spotTypeLabels = {
  'outdoor': 'Outdoor Parking Spot',
  'covered': 'Covered Parking Spot',
  'garage': 'Garage',
  'secure': 'Secure Parking (with CCTV)'
};

export default function ViewRentalDialog({ open, onClose, rental }) {
  const [loading, setLoading] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [mapUrl, setMapUrl] = useState('');
  const [showNavigation, setShowNavigation] = useState(false);
  
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (!rental?.owner?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/users/${rental.owner.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setOwnerDetails(data);
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (rental) {
      fetchOwnerDetails();
      
      // Generate Google Maps URL if coordinates are available
      if (rental.location?.coordinates) {
        const [lng, lat] = rental.location.coordinates;
        setMapUrl(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      }
    }
  }, [rental]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const calculateRentalDuration = () => {
    if (!rental?.rentDates?.startDate || !rental?.rentDates?.endDate) return { days: 0, totalCost: 0 };
    
    const startDate = new Date(rental.rentDates.startDate);
    const endDate = new Date(rental.rentDates.endDate);
    
    // Calculate difference in days
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate total cost
    const totalCost = diffDays * rental.pricing.daily;
    
    return { days: diffDays, totalCost };
  };
  
  const handleNavigateClick = () => {
    setShowNavigation(true);
  };
  
  const handleCloseNavigation = () => {
    setShowNavigation(false);
  };
  
  if (!rental) {
    return null;
  }
  
  // Show navigation view instead of dialog when navigation is active
  if (showNavigation) {
    return (
      <Dialog
        open={open}
        fullScreen
        onClose={handleCloseNavigation}
      >
        <SimplifiedNavigationView
          destination={rental}
          onClose={handleCloseNavigation}
        />
      </Dialog>
    );
  }

  const { days, totalCost } = calculateRentalDuration();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: '#2973B2', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DirectionsCar sx={{ mr: 1 }} />
          Rental Details
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'white',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="h5" sx={{ mb: 1, color: '#2973B2', fontWeight: 'bold' }}>
              {rental.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ color: '#9ACBD0', mr: 0.5 }} />
              <Typography variant="body1">
                {rental.address}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<NavigationOutlined />}
                onClick={handleNavigateClick}
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1,
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  }
                }}
              >
                Navigate to Parking Spot
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Parking Type
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <DirectionsCar sx={{ mr: 1, color: '#48A6A7' }} />
                    {spotTypeLabels[rental.spotType] || 'Standard Parking'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body1">
                    {rental.dimensions?.width || 2.4}m × {rental.dimensions?.length || 4.8}m
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ color: '#2973B2', mb: 1 }}>
              Reservation Details
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1, color: '#48A6A7', fontSize: 20 }} />
                    {formatDate(rental.rentDates?.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1, color: '#48A6A7', fontSize: 20 }} />
                    {formatDate(rental.rentDates?.endDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="h6" sx={{ color: '#2973B2', mb: 1 }}>
              Payment Details
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Daily Rate
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 0.5, color: '#48A6A7', fontSize: 20 }} />
                    £{rental.pricing?.daily || 0}/day
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rental Duration
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 0.5, color: '#48A6A7', fontSize: 20 }} />
                    {days} days
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Cost
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#2973B2', fontWeight: 'bold' }}>
                    £{totalCost}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Reservation ID: {rental._id}
              </Typography>
              <Chip 
                label="Active Reservation" 
                color="success" 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderColor: '#48A6A7',
                  color: '#48A6A7'
                }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: 200,
                  position: 'relative',
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Placeholder for map or image */}
                <LocationOn sx={{ fontSize: 60, color: '#9ACBD0' }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    textAlign: 'center',
                    p: 1,
                    bgcolor: 'rgba(255,255,255,0.8)'
                  }}
                >
                  {rental.address}
                </Typography>
              </Paper>
              
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<NavigationOutlined />}
                href={mapUrl}
                target="_blank"
                rel="noopener"
                sx={{ 
                  mt: 1,
                  borderColor: '#48A6A7',
                  color: '#48A6A7',
                  '&:hover': {
                    borderColor: '#2973B2',
                    color: '#2973B2',
                  }
                }}
              >
                Open in Google Maps
              </Button>
            </Box>
            
            <Typography variant="h6" sx={{ color: '#2973B2', mb: 2 }}>
              Owner Information
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} sx={{ color: '#48A6A7' }} />
              </Box>
            ) : ownerDetails ? (
              <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#9ACBD0',
                        color: '#2973B2',
                        width: 50,
                        height: 50,
                        mr: 2
                      }}
                    >
                      {ownerDetails.firstName?.[0] || 'O'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {ownerDetails.firstName} {ownerDetails.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating 
                          value={ownerDetails.ratings?.average || 0} 
                          readOnly 
                          size="small" 
                          precision={0.5}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({ownerDetails.ratings?.count || 0} reviews)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, fontSize: 18, color: '#9ACBD0' }} />
                    {ownerDetails.email}
                  </Typography>
                  
                  {ownerDetails.phoneNumber && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, fontSize: 18, color: '#9ACBD0' }} />
                      {ownerDetails.phoneNumber}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Owner information not available.
              </Typography>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              If you need to contact the owner or have any issues with your parking spot,
              please use the contact information above.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{
            borderColor: '#48A6A7',
            color: '#48A6A7',
            '&:hover': {
              borderColor: '#2973B2',
              color: '#2973B2',
            }
          }}
        >
          Close
        </Button>
        <Button 
          onClick={handleNavigateClick}
          variant="contained"
          startIcon={<NavigationOutlined />}
          sx={{
            bgcolor: '#48A6A7',
            '&:hover': {
              bgcolor: '#2973B2',
            }
          }}
        >
          Navigate
        </Button>
      </DialogActions>
    </Dialog>
  );
}