import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container, Grid } from '@mui/material';
import { DirectionsCar, LocalParking } from '@mui/icons-material';
import '../../styles/global.css';

const UserSelectionPage = () => {
  const navigate = useNavigate();

  const handleRent = () => {
    navigate('/book-parking');
  };

  const handleList = () => {
    navigate('/list-parking');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', my: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          color: '#2973B2', 
          fontWeight: 'bold',
          mb: 3 
        }}>
          Welcome to Park-O-Meter
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ 
          color: '#48A6A7',
          mb: 6
        }}>
          What would you like to do today?
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 10px 30px rgba(73, 166, 167, 0.2)'
                }
              }}
              onClick={handleRent}
            >
              <DirectionsCar sx={{ fontSize: 80, color: '#2973B2', mb: 2 }} />
              <Typography variant="h4" component="h3" sx={{ color: '#2973B2', mb: 2 }}>
                Find Parking
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Search for available parking spots in your area and book them for your desired duration.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  },
                  px: 4,
                  borderRadius: 2
                }}
                onClick={handleRent}
              >
                Book a Spot
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 10px 30px rgba(73, 166, 167, 0.2)'
                }
              }}
              onClick={handleList}
            >
              <LocalParking sx={{ fontSize: 80, color: '#2973B2', mb: 2 }} />
              <Typography variant="h4" component="h3" sx={{ color: '#2973B2', mb: 2 }}>
                List Parking
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Rent out your unused parking space and earn extra income by listing it on our platform.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{
                  bgcolor: '#48A6A7',
                  '&:hover': {
                    bgcolor: '#2973B2',
                  },
                  px: 4,
                  borderRadius: 2
                }}
                onClick={handleList}
              >
                List Your Space
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserSelectionPage;
