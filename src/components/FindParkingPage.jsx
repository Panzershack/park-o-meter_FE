import "../../styles/global.css";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Drawer,
  Divider,
  IconButton,
  Paper,
  InputAdornment,
  List,
  ListItem,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  Rating
} from "@mui/material";
import {
  LocalParking,
  Search,
  LocationOn,
  AttachMoney,
  DirectionsCar,
  CalendarToday,
  FilterList,
  Close,
  AccessTime,
  Check,
  Star,
  Info,
  EventBusy
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const mapOptions = {
  mapId: import.meta.env.VITE_PUBLIC_MAP_ID,
  center: { lat: 51.750576, lng: -0.236069 },
  zoom: 12,
  disableDefaultUI: false,
  heading: 0,
  tilt: 0,
};

const spotTypeLabels = {
  'outdoor': 'Outdoor Parking Spot',
  'covered': 'Covered Parking Spot',
  'garage': 'Garage',
  'secure': 'Secure Parking (with CCTV)'
};

export default function FindParkingPage() {
  return (
    <Wrapper 
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      <FindParkingMap />
    </Wrapper>
  );
}

function FindParkingMap() {
  const { currentUser } = useAuth();
  const [map, setMap] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1))
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRentals, setExistingRentals] = useState({});
  const [searchDates, setSearchDates] = useState({
    startDate: null,
    endDate: null
  });
  const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);
  const [isDateFilterDialogOpen, setIsDateFilterDialogOpen] = useState(false);
  const [isAvailabilityCheckLoading, setIsAvailabilityCheckLoading] = useState(false);
  
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const geocoderRef = useRef(null);
  const listContainerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      // Initialize the geocoder
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [map]);

  // Fetch listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/listings");
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Fetched listings:", data);
        
        // Filter out listings that the current user owns
        const filteredData = data.filter(
          listing => listing.owner.id !== currentUser?.uid
        );
        
        setListings(filteredData);
        setFilteredListings(filteredData);
        
        // Fetch rentals for each listing
        await fetchAllListingRentals(filteredData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setIsLoading(false);
        setSnackbarMessage("Failed to load parking listings");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    
    fetchListings();
  }, [currentUser]);

  // Fetch all rentals for listings
  const fetchAllListingRentals = async (listingsData) => {
    const rentalsObj = {};
    
    try {
      for (const listing of listingsData) {
        const response = await fetch(`http://localhost:5001/api/listings/${listing._id}/rentals`);
        
        if (response.ok) {
          const rentalData = await response.json();
          rentalsObj[listing._id] = rentalData;
        }
      }
      
      setExistingRentals(rentalsObj);
    } catch (error) {
      console.error("Error fetching rentals data:", error);
    }
  };

  // Create and update markers when listings or map changes
  useEffect(() => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    if (!map || filteredListings.length === 0) return;
    
    const newMarkers = filteredListings.map(listing => {
      const position = {
        lat: listing.location.coordinates[1],
        lng: listing.location.coordinates[0]
      };
      
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: listing.title,
        animation: google.maps.Animation.DROP,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        }
      });
      
      // Create info window for each marker
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #2973B2;">${listing.title}</h3>
            <p style="margin: 0 0 4px; font-size: 13px;">£${listing.pricing.hourly}/hour</p>
            <p style="margin: 0; font-size: 13px;">${spotTypeLabels[listing.spotType]}</p>
          </div>
        `
      });
      
      // Add click listener to marker
      marker.addListener("click", () => {
        // Close any open info windows
        if (selectedMarker) {
          selectedMarker.infoWindow.close();
        }
        
        // Open this info window
        infoWindow.open(map, marker);
        setSelectedMarker({ marker, infoWindow });
        
        // Select listing in the list
        setSelectedListing(listing);
        
        // Scroll to the listing in the list
        const listingElement = document.getElementById(`listing-${listing._id}`);
        if (listingElement && listContainerRef.current) {
          listContainerRef.current.scrollTo({
            top: listingElement.offsetTop,
            behavior: 'smooth'
          });
        }
      });
      
      return marker;
    });
    
    setMarkers(newMarkers);
    
    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
      
      // Zoom out slightly for better context
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
      });
    }
    
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, filteredListings]);

  // Check if a listing is available for the selected dates
  const checkListingAvailability = async (listingId, startDate, endDate) => {
    if (!startDate || !endDate) return true;
    
    try {
      setIsAvailabilityCheckLoading(true);
      
      const startDateParam = encodeURIComponent(startDate.toISOString());
      const endDateParam = encodeURIComponent(endDate.toISOString());
      
      const response = await fetch(
        `http://localhost:5001/api/listings/${listingId}/availability?startDate=${startDateParam}&endDate=${endDateParam}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      
      const availabilityData = await response.json();
      return availabilityData.isAvailable;
    } catch (error) {
      console.error("Error checking listing availability:", error);
      return false;
    } finally {
      setIsAvailabilityCheckLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    
    if (!e.target.value.trim()) {
      applyAllFilters(listings, searchDates);
      return;
    }
    
    // Filter listings based on search term
    const searchFiltered = listings.filter(listing => 
      listing.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
      listing.address.toLowerCase().includes(e.target.value.toLowerCase()) ||
      listing.description.toLowerCase().includes(e.target.value.toLowerCase())
    );
    
    applyAllFilters(searchFiltered, searchDates);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (!searchValue.trim() || !geocoderRef.current || !map) return;
    
    // Use geocoder to find the location
    geocoderRef.current.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        // Center map on the first result
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
      }
    });
  };

  // Apply all filters (search and date)
  const applyAllFilters = (baseListings, dateFilters) => {
    // If date filter is disabled or dates are not selected, just use the search filtered listings
    if (!isDateFilterEnabled || !dateFilters.startDate || !dateFilters.endDate) {
      setFilteredListings(baseListings);
      return;
    }
    
    // Apply date filters
    const dateFiltered = baseListings.filter(listing => {
      const listingRentals = existingRentals[listing._id] || [];
      
      // Check if any rental overlaps with the search dates
      const hasConflict = listingRentals.some(rental => {
        const rentalStart = new Date(rental.startDate);
        const rentalEnd = new Date(rental.endDate);
        
        return (
          (dateFilters.startDate < rentalEnd && dateFilters.endDate > rentalStart)
        );
      });
      
      // Include listings without conflicts
      return !hasConflict;
    });
    
    setFilteredListings(dateFiltered);
  };

  // Handle date filter submission
  const handleDateFilterSubmit = () => {
    setSearchDates({
      startDate: searchDates.startDate,
      endDate: searchDates.endDate
    });
    
    applyAllFilters(listings.filter(listing => 
      searchValue.trim() ? 
      (listing.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      listing.address.toLowerCase().includes(searchValue.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchValue.toLowerCase())) : true
    ), searchDates);
    
    setIsDateFilterDialogOpen(false);
    setIsDateFilterEnabled(true);
  };

  // Clear date filters
  const handleClearDateFilter = () => {
    setSearchDates({
      startDate: null,
      endDate: null
    });
    
    setIsDateFilterEnabled(false);
    
    // Apply only search filters
    const searchFiltered = listings.filter(listing => 
      searchValue.trim() ? 
      (listing.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      listing.address.toLowerCase().includes(searchValue.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchValue.toLowerCase())) : true
    );
    
    setFilteredListings(searchFiltered);
  };

  // Handle rent button click
  const handleRentClick = async (listing) => {
    // Check if user is trying to rent their own spot
    if (listing.owner.id === currentUser?.uid) {
      setSnackbarMessage("You cannot rent your own parking spot");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    
    setSelectedListing(listing);
    
    // Set search dates as default if they exist
    if (searchDates.startDate && searchDates.endDate) {
      setSelectedDates({
        startDate: searchDates.startDate,
        endDate: searchDates.endDate
      });
    }
    
    setIsRentDialogOpen(true);
  };

  // Check for rental date conflicts
  const hasRentalConflict = () => {
    if (!selectedListing || !selectedDates.startDate || !selectedDates.endDate) return false;
    
    const listingRentals = existingRentals[selectedListing._id] || [];
    
    return listingRentals.some(rental => {
      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);
      
      // Check if the selected dates overlap with any existing rental
      return (selectedDates.startDate < rentalEnd && selectedDates.endDate > rentalStart);
    });
  };

  // Get conflicting rental dates for the selected listing
  const getConflictingDates = () => {
    if (!selectedListing) return [];
    
    const listingRentals = existingRentals[selectedListing._id] || [];
    
    return listingRentals.map(rental => ({
      start: new Date(rental.startDate),
      end: new Date(rental.endDate)
    }));
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle rent confirmation
  const handleRentConfirm = async () => {
    if (!currentUser) {
      setSnackbarMessage("Please log in to rent a parking spot");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    
    if (hasRentalConflict()) {
      setSnackbarMessage("This spot is already booked for the selected dates");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate total cost (days * daily rate)
      const days = Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24));
      const totalCost = days * selectedListing.pricing.daily;
      
      // Create rental using the new rental API
      const response = await fetch('http://localhost:5001/api/rentals', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          listingId: selectedListing._id,
          renterId: currentUser.uid,
          renterName: currentUser.email,
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          totalCost: totalCost
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create rental");
      }
      
      const newRental = await response.json();
      
      // Update local rental state
      setExistingRentals(prev => ({
        ...prev,
        [selectedListing._id]: [...(prev[selectedListing._id] || []), newRental]
      }));
      
      // Show success message
      setSnackbarMessage("Parking spot rented successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      // Close dialog
      setIsRentDialogOpen(false);
      
      // If date filter is active, reapply filters
      if (isDateFilterEnabled) {
        applyAllFilters(listings.filter(listing => 
          searchValue.trim() ? 
          (listing.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          listing.address.toLowerCase().includes(searchValue.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchValue.toLowerCase())) : true
        ), searchDates);
      }
    } catch (error) {
      console.error("Error renting parking spot:", error);
      setSnackbarMessage(error.message || "Failed to rent parking spot");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a listing has any upcoming bookings
  const hasUpcomingBookings = (listingId) => {
    const rentals = existingRentals[listingId] || [];
    const now = new Date();
    
    return rentals.some(rental => new Date(rental.endDate) > now);
  };

  // Get information about upcoming bookings for display
  const getBookingInfo = (listingId) => {
    const rentals = existingRentals[listingId] || [];
    const upcomingRentals = rentals
      .filter(rental => new Date(rental.endDate) > new Date())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    if (upcomingRentals.length === 0) return null;
    
    return {
      count: upcomingRentals.length,
      nextRental: upcomingRentals[0]
    };
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Map Container (55% of height) */}
      <Box sx={{ width: '100%', height: '55vh', position: 'relative' }}>
        {/* Map */}
        <div ref={mapRef} id="map" style={{ height: '100%', width: '100%' }} />
        
        {/* Search box */}
        <Box 
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ 
            position: 'absolute', 
            top: 20, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 10, 
            width: { xs: 240, sm: 320, md: 400 },
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 3,
            p: 0.5
          }}
        >
          <TextField
            fullWidth
            placeholder="Search for parking spots..."
            value={searchValue}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              )
            }}
            sx={{ 
              bgcolor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              }
            }}
          />
          <Button 
            type="submit"
            variant="contained"
            sx={{ 
              ml: 1,
              bgcolor: '#48A6A7',
              '&:hover': {
                bgcolor: '#2973B2',
              }
            }}
          >
            <Search />
          </Button>
        </Box>
        
        {/* Date filter button */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 80, 
            right: 20, 
            zIndex: 10, 
          }}
        >
          <Button
            variant="contained"
            startIcon={<CalendarToday />}
            onClick={() => setIsDateFilterDialogOpen(true)}
            sx={{ 
              bgcolor: isDateFilterEnabled ? '#2973B2' : '#48A6A7',
              '&:hover': {
                bgcolor: '#2973B2',
              }
            }}
          >
            {isDateFilterEnabled ? 'Change Dates' : 'Filter by Date'}
          </Button>
          
          {isDateFilterEnabled && (
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={handleClearDateFilter}
              sx={{ 
                ml: 1,
                borderColor: '#48A6A7',
                color: '#48A6A7',
                '&:hover': {
                  borderColor: '#2973B2',
                  color: '#2973B2',
                }
              }}
            >
              Clear
            </Button>
          )}
        </Box>
        
        {/* Date filter info */}
        {isDateFilterEnabled && searchDates.startDate && searchDates.endDate && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 130, 
              right: 20, 
              zIndex: 10,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              p: 1,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2973B2' }}>
              Showing available spots for:
            </Typography>
            <Typography variant="body2">
              {formatDate(searchDates.startDate)} - {formatDate(searchDates.endDate)}
            </Typography>
          </Box>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 5
            }}
          >
            <CircularProgress sx={{ color: '#48A6A7' }} />
          </Box>
        )}
      </Box>
      
      {/* Listings Container (45% of height) */}
      <Box 
        ref={listContainerRef}
        sx={{ 
          width: '100%', 
          height: '45vh', 
          bgcolor: '#F2EFE7',
          overflowY: 'auto',
          borderTop: '4px solid #9ACBD0',
          boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ color: '#2973B2', fontWeight: 600 }}>
              <LocalParking sx={{ mr: 1, verticalAlign: 'bottom' }} />
              Available Parking Spots
              <Chip 
                label={`${filteredListings.length} found`} 
                size="small" 
                sx={{ ml: 2, bgcolor: '#9ACBD0', color: '#2973B2' }} 
              />
            </Typography>
          </Box>
          
          {filteredListings.length === 0 && !isLoading ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: 'white', 
                borderRadius: 2,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No parking spots found matching your search.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchValue("");
                  handleClearDateFilter();
                  setFilteredListings(listings);
                }} 
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredListings.map((listing) => {
                const bookingInfo = getBookingInfo(listing._id);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={listing._id}>
                    <Card 
                      id={`listing-${listing._id}`}
                      className="card-hover"
                      elevation={2} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        bgcolor: selectedListing?._id === listing._id ? '#F0F8F8' : 'white',
                        border: selectedListing?._id === listing._id ? '2px solid #48A6A7' : 'none'
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#2973B2', fontWeight: 600, flexGrow: 1 }}>
                            {listing.title}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={spotTypeLabels[listing.spotType]} 
                            sx={{ 
                              bgcolor: '#E8F4F4',
                              color: '#48A6A7',
                              fontWeight: 500
                            }} 
                          />
                        </Box>
                        
                        {bookingInfo && (
                          <Box sx={{ mb: 1, mt: 1 }}>
                            <Chip 
                              size="small" 
                              icon={<EventBusy sx={{ fontSize: 16 }} />}
                              label={bookingInfo.count > 1 
                                ? `${bookingInfo.count} upcoming bookings` 
                                : `Booked ${formatDate(bookingInfo.nextRental.startDate)} - ${formatDate(bookingInfo.nextRental.endDate)}`
                              }
                              color="warning"
                            />
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 0.5, color: '#9ACBD0' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {listing.address}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {listing.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ fontSize: 16, mr: 0.5, color: '#9ACBD0' }} />
                            <Typography variant="body2" color="text.secondary">
                              £{listing.pricing.hourly}/hr
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#9ACBD0' }} />
                            <Typography variant="body2" color="text.secondary">
                              £{listing.pricing.daily}/day
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DirectionsCar sx={{ fontSize: 16, mr: 0.5, color: '#9ACBD0' }} />
                          <Typography variant="body2" color="text.secondary">
                            {listing.dimensions.width}m × {listing.dimensions.length}m
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', p: 1 }}>
                        {listing.owner.id === currentUser?.uid ? (
                          <Chip 
                            label="Your listing" 
                            size="small"
                            color="primary"
                            sx={{ bgcolor: '#9ACBD0', color: '#2973B2' }}
                          />
                        ) : (
                          <Button 
                            size="small" 
                            variant="contained"
                            startIcon={<AttachMoney />}
                            onClick={() => handleRentClick(listing)}
                            sx={{
                              bgcolor: '#48A6A7',
                              '&:hover': {
                                bgcolor: '#2973B2',
                              }
                            }}
                          >
                            Rent
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
      
      {/* Date Filter Dialog */}
      <Dialog
        open={isDateFilterDialogOpen}
        onClose={() => setIsDateFilterDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#2973B2', color: 'white' }}>
          Filter by Date
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Select dates to find available parking spots:
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Start Date
                </Typography>
                <DatePicker
                  value={searchDates.startDate}
                  onChange={(date) => setSearchDates(prev => ({ ...prev, startDate: date }))}
                  minDate={new Date()}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  End Date
                </Typography>
                <DatePicker
                  value={searchDates.endDate}
                  onChange={(date) => setSearchDates(prev => ({ ...prev, endDate: date }))}
                  minDate={searchDates.startDate || new Date()}
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setIsDateFilterDialogOpen(false)}
            sx={{ color: '#48A6A7' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleDateFilterSubmit}
            disabled={!searchDates.startDate || !searchDates.endDate}
            startIcon={<FilterList />}
            sx={{
              bgcolor: '#48A6A7',
              '&:hover': {
                bgcolor: '#2973B2',
              }
            }}
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rent Dialog */}
      <Dialog
        open={isRentDialogOpen}
        onClose={() => !isSubmitting && setIsRentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#2973B2', color: 'white' }}>
          Rent Parking Spot
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          {selectedListing && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedListing.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ mt: 0.5, mr: 1, color: '#9ACBD0' }} />
                <Typography variant="body1">
                  {selectedListing.address}
                </Typography>
              </Box>
              
              {/* Show existing bookings */}
              {existingRentals[selectedListing._id]?.length > 0 && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#FFF9C4', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#E65100', display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1, fontSize: 18 }} />
                    This spot has existing bookings:
                  </Typography>
                  {existingRentals[selectedListing._id]
                    .filter(rental => new Date(rental.endDate) > new Date())
                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                    .map((rental, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 3, color: '#BF360C' }}>
                        • {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
                      </Typography>
                    ))
                  }
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#2973B2' }}>
                    Spot Type
                  </Typography>
                  <Typography variant="body2">
                    {spotTypeLabels[selectedListing.spotType]}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#2973B2' }}>
                    Dimensions
                  </Typography>
                  <Typography variant="body2">
                    {selectedListing.dimensions.width}m × {selectedListing.dimensions.length}m
                  </Typography>
                </Grid>
              </Grid>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#2973B2' }}>
                    Hourly Rate
                  </Typography>
                  <Typography variant="body2">
                    £{selectedListing.pricing.hourly}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: '#2973B2' }}>
                    Daily Rate
                  </Typography>
                  <Typography variant="body2">
                    £{selectedListing.pricing.daily}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#2973B2' }}>
                Select Rental Period
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Start Date
                    </Typography>
                    <DatePicker
                      value={selectedDates.startDate}
                      onChange={(date) => setSelectedDates(prev => ({ ...prev, startDate: date }))}
                      minDate={new Date()}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      End Date
                    </Typography>
                    <DatePicker
                      value={selectedDates.endDate}
                      onChange={(date) => setSelectedDates(prev => ({ ...prev, endDate: date }))}
                      minDate={selectedDates.startDate || new Date()}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
              
              {/* Warning if dates conflict */}
              {hasRentalConflict() && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#FFEBEE', borderRadius: 1 }}>
                  <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1, fontSize: 18 }} />
                    These dates conflict with an existing booking. Please select different dates.
                  </Typography>
                </Box>
              )}
              
              {/* Pricing summary */}
              {selectedDates.startDate && selectedDates.endDate && !hasRentalConflict() && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F0F8F8', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: '#2973B2' }}>
                    Rental Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      From {formatDate(selectedDates.startDate)} to {formatDate(selectedDates.endDate)}
                    </Typography>
                    <Typography variant="body2">
                      {Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24))} days
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="subtitle2">
                      Estimated Total
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      £{Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24)) * selectedListing.pricing.daily}
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setIsRentDialogOpen(false)}
            disabled={isSubmitting}
            sx={{ color: '#48A6A7' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleRentConfirm}
            disabled={isSubmitting || !selectedDates.startDate || !selectedDates.endDate || hasRentalConflict()}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Check />}
            sx={{
              bgcolor: '#48A6A7',
              '&:hover': {
                bgcolor: '#2973B2',
              }
            }}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Rental'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}