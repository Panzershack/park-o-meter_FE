import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  LocationOn, 
  LocalParking, 
  DirectionsCar, 
  AttachMoney, 
  CalendarToday, 
  Save, 
  Close 
} from '@mui/icons-material';

const spotTypes = [
  { id: 'outdoor', label: 'Outdoor Parking Spot', priceMultiplier: 1.0 },
  { id: 'covered', label: 'Covered Parking Spot', priceMultiplier: 1.5 },
  { id: 'garage', label: 'Garage', priceMultiplier: 2.0 },
  { id: 'secure', label: 'Secure Parking (with CCTV)', priceMultiplier: 1.8 }
];

export default function EditListingDialog({ open, onClose, listing, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    spotType: 'outdoor',
    dimensions: {
      width: 2.4,
      length: 4.8
    },
    availability: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    },
    pricing: {
      hourly: 1,
      daily: 12
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form with listing data when dialog opens
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        spotType: listing.spotType || 'outdoor',
        dimensions: {
          width: listing.dimensions?.width || 2.4,
          length: listing.dimensions?.length || 4.8
        },
        availability: {
          startDate: new Date(listing.availability?.startDate) || new Date(),
          endDate: new Date(listing.availability?.endDate) || new Date(new Date().setMonth(new Date().getMonth() + 3))
        },
        pricing: {
          hourly: listing.pricing?.hourly || 1,
          daily: listing.pricing?.daily || 12
        }
      });
    }
  }, [listing]);
  
  // Calculate price based on area and spot type
  useEffect(() => {
    const { width, length } = formData.dimensions;
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
      pricing: {
        hourly: hourlyPrice,
        daily: dailyPrice
      }
    }));
  }, [formData.dimensions, formData.spotType]);

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

  const handleSubmit = async () => {
    if (!listing?._id) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Create updated listing data
      const updatedListing = {
        title: formData.title,
        description: formData.description,
        spotType: formData.spotType,
        dimensions: {
          width: parseFloat(formData.dimensions.width),
          length: parseFloat(formData.dimensions.length)
        },
        availability: {
          startDate: formData.availability.startDate,
          endDate: formData.availability.endDate
        },
        pricing: {
          hourly: formData.pricing.hourly,
          daily: formData.pricing.daily
        }
      };
      
      // Send update to backend
      const response = await fetch(`http://localhost:5001/api/listings/${listing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedListing)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listing');
      }
      
      const updatedData = await response.json();
      
      // Call the onSave callback with the updated listing
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating listing:", error);
      setError('Failed to update listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#2973B2', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalParking sx={{ mr: 1 }} />
          Edit Parking Spot
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'white',
            p: 0
          }}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2973B2' }}>
              Basic Information
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalParking color="action" />
                  </InputAdornment>
                ),
              }}
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
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2973B2' }}>
              Dimensions & Availability
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: '#48A6A7' }}>
              Parking Spot Dimensions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Width (m)"
                  name="dimensions.width"
                  type="number"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><DirectionsCar fontSize="small" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                  inputProps={{ step: 0.1, min: 1.5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Length (m)"
                  name="dimensions.length"
                  type="number"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><DirectionsCar fontSize="small" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                  inputProps={{ step: 0.1, min: 2.5 }}
                />
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, color: '#48A6A7' }}>
              Availability Period
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Available From"
                    value={formData.availability.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    disablePast
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="Available Until"
                    value={formData.availability.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    minDate={formData.availability.startDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, color: '#48A6A7' }}>
              Pricing (Automatically Calculated)
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate"
                  value={formData.pricing.hourly}
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
                  value={formData.pricing.daily}
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
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          color="primary"
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{
            bgcolor: '#48A6A7',
            '&:hover': {
              bgcolor: '#2973B2',
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}