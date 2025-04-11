import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Divider,
  TextField,
  Avatar,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Rating,
  Skeleton
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  PhoneAndroid,
  Home,
  Email,
  Star,
  LocalParking,
  DirectionsCar,
  Delete,
  CalendarToday,
  AttachMoney,
  LocationOn,
  Visibility
} from '@mui/icons-material';

// Import custom dialog components
import EditListingDialog from '../components/EditListingDialog';
import ViewRentalDialog from '../components/ViewRentalDialog';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userRentals, setUserRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);
  
  // States for edit listing dialog
  const [editListingDialogOpen, setEditListingDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  
  // States for view rental dialog
  const [viewRentalDialogOpen, setViewRentalDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  
  // Form state for user details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    street: '',
    city: '',
    postcode: ''
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Fetch user details
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = await fetch(`http://localhost:5001/api/users/${currentUser.uid}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUserDetails(userData);
        
        // Set form data based on user details
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
          street: userData.residentialAddress?.street || '',
          city: userData.residentialAddress?.city || '',
          postcode: userData.residentialAddress?.postcode || ''
        });
        
        // Fetch user's listings
        const listingsResponse = await fetch(`http://localhost:5001/api/listings/user/${currentUser.uid}`);
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setUserListings(listingsData);
        }
        
        // Fetch user's rentals
        const rentalsResponse = await fetch(`http://localhost:5001/api/listings/rented/${currentUser.uid}`);
        if (rentalsResponse.ok) {
          const rentalsData = await rentalsResponse.json();
          setUserRentals(rentalsData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbarMessage('Failed to load user data');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        residentialAddress: {
          street: formData.street,
          city: formData.city,
          postcode: formData.postcode,
          country: 'UK'
        }
      };
      
      const response = await fetch(`http://localhost:5001/api/users/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUserDetails(updatedUser);
      setEditMode(false);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbarMessage('Failed to update profile');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteListing = (listing) => {
    setCurrentListing(listing);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteListing = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/listings/${currentListing._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Update listings state
      setUserListings(userListings.filter(listing => listing._id !== currentListing._id));
      
      setSnackbarMessage('Listing deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting listing:', error);
      setSnackbarMessage('Failed to delete listing');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setEditListingDialogOpen(true);
  };
  
  const handleViewRental = (rental) => {
    setSelectedRental(rental);
    setViewRentalDialogOpen(true);
  };
  
  const handleSaveEditedListing = (updatedListing) => {
    // Update listings in state
    setUserListings(userListings.map(listing => 
      listing._id === updatedListing._id ? updatedListing : listing
    ));
    
    setSnackbarMessage('Listing updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      {/* User Profile Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #2973B2, #48A6A7)',
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#9ACBD0',
                color: '#2973B2',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {userDetails?.firstName ? userDetails.firstName[0] : 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {userDetails?.firstName} {userDetails?.lastName}
            </Typography>
            <Typography variant="body1">
              <Email sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
              {userDetails?.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                icon={<LocalParking />} 
                label={`${userDetails?.listingCount || 0} Listings`} 
                sx={{ mr: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} 
              />
              <Chip 
                icon={<DirectionsCar />} 
                label={`${userDetails?.rentedSpots || 0} Rented Spots`} 
                sx={{ mr: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} 
              />
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <Rating 
                  value={userDetails?.ratings?.average || 0} 
                  precision={0.5} 
                  readOnly 
                  size="small"
                />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  ({userDetails?.ratings?.count || 0})
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/list-parking')}
              sx={{ 
                borderRadius: 2,
                bgcolor: 'white',
                color: '#2973B2',
                '&:hover': {
                  bgcolor: '#F2EFE7',
                }
              }}
            >
              <LocalParking sx={{ mr: 1 }} /> List a Parking Spot
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600
            }
          }}
        >
          <Tab label="Profile Details" icon={<Person />} iconPosition="start" {...a11yProps(0)} />
          <Tab 
            label={`My Listings (${userListings.length})`} 
            icon={<LocalParking />} 
            iconPosition="start" 
            {...a11yProps(1)} 
          />
          <Tab 
            label={`My Rentals (${userRentals.length})`} 
            icon={<DirectionsCar />} 
            iconPosition="start" 
            {...a11yProps(2)} 
          />
        </Tabs>
      </Box>

      {/* Profile Details Tab */}
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#2973B2', fontWeight: 'bold', mb: 2 }}>
              Personal Details
            </Typography>
            <Button 
              startIcon={editMode ? <Save /> : <Edit />}
              onClick={() => {
                if (editMode) {
                  handleSaveProfile();
                } else {
                  setEditMode(true);
                }
              }}
              color={editMode ? "success" : "primary"}
              variant={editMode ? "contained" : "outlined"}
            >
              {editMode ? "Save Changes" : "Edit Profile"}
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Person sx={{ color: '#9ACBD0', mr: 1 }} />,
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Person sx={{ color: '#9ACBD0', mr: 1 }} />,
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder={!formData.phoneNumber && editMode ? 'Add your phone number' : ''}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <PhoneAndroid sx={{ color: '#9ACBD0', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ color: '#2973B2', mb: 1 }}>
                Residential Address
              </Typography>
              <TextField
                fullWidth
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder={!formData.street && editMode ? 'Add street address' : ''}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Home sx={{ color: '#9ACBD0', mr: 1 }} />,
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder={!formData.city && editMode ? 'Add city' : ''}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder={!formData.postcode && editMode ? 'Add postcode' : ''}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Country"
                value="United Kingdom"
                disabled
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          
          {editMode && (
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                onClick={() => setEditMode(false)} 
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveProfile}
                color="success"
              >
                <Save sx={{ mr: 1 }} /> Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* My Listings Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box>
          <Typography variant="h6" sx={{ color: '#2973B2', fontWeight: 'bold', mb: 2 }}>
            My Parking Spots
          </Typography>
          
          {userListings.length === 0 ? (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: 2,
                backgroundColor: '#f5f5f5'
              }}
            >
              <LocalParking sx={{ fontSize: 60, color: '#9ACBD0', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#2973B2' }}>
                No Listings Yet
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                You haven't listed any parking spots. Start earning by listing your parking spot now!
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/list-parking')}
                color="primary"
                sx={{ borderRadius: 20 }}
              >
                <LocalParking sx={{ mr: 1 }} /> List a Spot
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {userListings.map((listing) => (
                <Grid item xs={12} md={6} lg={4} key={listing._id}>
                  <Card 
                    className="card-hover"
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      position: 'relative'
                    }}
                  >
                    {listing.isRented && (
                      <Chip 
                        label="Currently Rented" 
                        color="primary" 
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          zIndex: 1,
                          bgcolor: '#48A6A7'
                        }} 
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2973B2', mb: 1 }}>
                        {listing.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: '#9ACBD0', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {listing.address}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            <AttachMoney sx={{ fontSize: 16, color: '#9ACBD0', mr: 0.5 }} />
                            £{listing.pricing.hourly}/hour
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            <AttachMoney sx={{ fontSize: 16, color: '#9ACBD0', mr: 0.5 }} />
                            £{listing.pricing.daily}/day
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography variant="body2" color="text.secondary">
                        <CalendarToday sx={{ fontSize: 16, color: '#9ACBD0', mr: 0.5 }} />
                        Available until: {formatDate(listing.availability.endDate)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ borderTop: '1px solid #f0f0f0', justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        startIcon={<Edit />}
                        onClick={() => handleEditListing(listing)}
                        color="primary"
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<Delete />}
                        onClick={() => handleDeleteListing(listing)}
                        color="error"
                        disabled={listing.isRented}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </TabPanel>

      {/* My Rentals Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box>
          <Typography variant="h6" sx={{ color: '#2973B2', fontWeight: 'bold', mb: 2 }}>
            My Rented Parking Spots
          </Typography>
          
          {userRentals.length === 0 ? (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: 2,
                backgroundColor: '#f5f5f5'
              }}
            >
              <DirectionsCar sx={{ fontSize: 60, color: '#9ACBD0', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#2973B2' }}>
                No Rentals Yet
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                You haven't rented any parking spots. Find convenient and affordable spots now!
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/find-parking')}
                color="primary"
                sx={{ borderRadius: 20 }}
              >
                <DirectionsCar sx={{ mr: 1 }} /> Find Parking
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {userRentals.map((rental) => (
                <Grid item xs={12} md={6} lg={4} key={rental._id}>
                  <Card 
                    className="card-hover"
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      position: 'relative'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2973B2', mb: 1 }}>
                        {rental.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: '#9ACBD0', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {rental.address}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Rental Period:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(rental.rentDates.startDate)} - {formatDate(rental.rentDates.endDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          <AttachMoney sx={{ fontSize: 16, color: '#9ACBD0', mr: 0.5 }} />
                          £{rental.pricing.daily}/day
                        </Typography>
                        <Chip 
                          label="Active" 
                          size="small" 
                          color="success" 
                          sx={{ bgcolor: '#48A6A7' }} 
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ borderTop: '1px solid #f0f0f0', justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => handleViewRental(rental)}
                        sx={{ 
                          bgcolor: '#48A6A7',
                          '&:hover': {
                            bgcolor: '#2973B2',
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the parking spot "{currentListing?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteListing} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Listing Dialog */}
      <EditListingDialog 
        open={editListingDialogOpen}
        onClose={() => setEditListingDialogOpen(false)}
        listing={selectedListing}
        onSave={handleSaveEditedListing}
      />

      {/* View Rental Dialog */}
      <ViewRentalDialog
        open={viewRentalDialogOpen}
        onClose={() => setViewRentalDialogOpen(false)}
        rental={selectedRental}
      />

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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}