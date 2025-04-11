import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/LandingPage1.png';
import appFlowImage from '../assets/LandingPage2.png';
import testimonial1 from '../assets/testimonial1.jpg';
import testimonial2 from '../assets/testimonial2.jpg';
import testimonial3 from '../assets/testimonial3.jpg';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Avatar, 
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  Security as SecurityIcon, 
  Payment as PaymentIcon, 
  Star as StarIcon,
  DirectionsCar as CarIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Money as MoneyIcon
} from '@mui/icons-material';
import '../../styles/LandingPage.css';

const ParkOMeter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <Box className="hero-section">
        <div className="hero-background"></div>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} className="hero-content">
              <Typography variant="h3" component="h1" className="hero-title">
                On-Demand Parking Solution for Urban Mobility
              </Typography>
              <Typography variant="h5" component="h2" className="hero-subtitle">
                Rent and rent-out parking spots with ease
              </Typography>
              <Typography variant="body1" paragraph>
                Find safe, affordable parking in busy urban areas. Use real-time location data to discover available spots within your selected radius and book in advance.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 4 }}>
                <Button variant="contained" size="large" className="download-button" onClick={() => navigate("/selection")}>
                  Get Started
                </Button>
                <Button variant="outlined" size="large" className="learn-button">
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box 
                component="img"
                className="hero-image"
                alt="Park-O-Meter App Showcase"
                src={heroImage}
                sx={{ width: '100%', maxWidth: isMobile ? '90%' : '80%', borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Location Search Bar */}
      <Box className="search-section">
        <Container maxWidth="md">
          <Card className="search-card">
            <CardContent>
              <Typography variant="h6" component="h3" className="search-title" gutterBottom>
                Find Parking Near You
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Enter location"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Date"
                    variant="outlined"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    className="search-button"
                    size="large"
                    onClick={() => navigate("/find-parking")}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box className="stats-section">
        <Container>
          <Grid container spacing={3} justifyContent="center" textAlign="center">
            <Grid item xs={6} md={3}>
              <Typography variant="h3" component="div" className="stat-value">
                20%
              </Typography>
              <Typography variant="body1" className="stat-label">
                Reduced Parking Time
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" component="div" className="stat-value">
                95%
              </Typography>
              <Typography variant="body1" className="stat-label">
                Location Accuracy
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" component="div" className="stat-value">
                99.5%
              </Typography>
              <Typography variant="body1" className="stat-label">
                System Uptime
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" component="div" className="stat-value">
                8/10
              </Typography>
              <Typography variant="body1" className="stat-label">
                User Satisfaction
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Key Features Section */}
      <Box className="features-section">
        <Container>
          <Typography variant="h4" component="h2" className="section-title">
            Key Features
          </Typography>
          <div className="section-divider"></div>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="feature-card">
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Avatar className="feature-icon floating-icon">
                    <LocationIcon />
                  </Avatar>
                  <Typography variant="h5" component="h3" className="feature-title">
                    Location-Based Services
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Find available parking spots within your selected radius using advanced mapping APIs and real-time location data.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="feature-card">
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Avatar className="feature-icon floating-icon">
                    <PaymentIcon />
                  </Avatar>
                  <Typography variant="h5" component="h3" className="feature-title">
                    Secure Payments
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Integrated reliable payment services to handle transactions securely between parking spot owners and users.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="feature-card">
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Avatar className="feature-icon floating-icon">
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="h5" component="h3" className="feature-title">
                    Enhanced Security
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Park in safer areas to reduce insurance costs and ensure your vehicle remains secure throughout your booking.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box className="how-it-works-section">
        <Container>
          <Typography variant="h4" component="h2" className="section-title">
            How It Works
          </Typography>
          <div className="section-divider"></div>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="step-container">
                <Box className="step-number">1</Box>
                <Typography variant="h5" component="h3" className="step-title">
                  Register and Set Up Your Profile
                </Typography>
                <Typography variant="body1" paragraph>
                  Create an account and set up your profile as either a parking spot renter or owner.
                </Typography>
              </Box>
              
              <Box className="step-container">
                <Box className="step-number">2</Box>
                <Typography variant="h5" component="h3" className="step-title">
                  Search for Available Spots
                </Typography>
                <Typography variant="body1" paragraph>
                  Use the app to search for available parking spots within your desired location radius.
                </Typography>
              </Box>
              
              <Box className="step-container">
                <Box className="step-number">3</Box>
                <Typography variant="h5" component="h3" className="step-title">
                  Book and Pay Securely
                </Typography>
                <Typography variant="body1" paragraph>
                  Book your spot for short or long-term contracts and pay securely through our integrated payment system.
                </Typography>
              </Box>
              
              <Box className="step-container">
                <Box className="step-number">4</Box>
                <Typography variant="h5" component="h3" className="step-title">
                  Park with Confidence
                </Typography>
                <Typography variant="body1" paragraph>
                  Navigate to your reserved spot and enjoy safe, affordable parking without the hassle.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                className="how-it-works-image"
                alt="Park-O-Meter App Flow"
                src={appFlowImage}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* User Benefits Section */}
      <Box className="benefits-section">
        <Container>
          <Typography variant="h4" component="h2" className="section-title">
            Benefits
          </Typography>
          <div className="section-divider"></div>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" className="benefits-subtitle">
                For Parking Space Renters
              </Typography>
              <Box className="benefit-item">
                <TimeIcon className="benefit-icon" />
                <Typography variant="body1">
                  Save time finding parking in busy urban areas
                </Typography>
              </Box>
              <Box className="benefit-item">
                <MoneyIcon className="benefit-icon" />
                <Typography variant="body1">
                  Avoid expensive commercial parking fees
                </Typography>
              </Box>
              <Box className="benefit-item">
                <SecurityIcon className="benefit-icon" />
                <Typography variant="body1">
                  Park in safer locations to reduce insurance costs
                </Typography>
              </Box>
              <Box className="benefit-item">
                <PhoneIcon className="benefit-icon" />
                <Typography variant="body1">
                  Access customer support for assistance when needed
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" className="benefits-subtitle">
                For Parking Space Owners
              </Typography>
              <Box className="benefit-item">
                <MoneyIcon className="benefit-icon" />
                <Typography variant="body1">
                  Generate additional income from your unused parking space
                </Typography>
              </Box>
              <Box className="benefit-item">
                <SaveIcon className="benefit-icon" />
                <Typography variant="body1">
                  Easy management of your parking space availability
                </Typography>
              </Box>
              <Box className="benefit-item">
                <StarIcon className="benefit-icon" />
                <Typography variant="body1">
                  Build reputation through ratings and reviews
                </Typography>
              </Box>
              <Box className="benefit-item">
                <SecurityIcon className="benefit-icon" />
                <Typography variant="body1">
                  Secure verification of parking space ownership
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box className="testimonials-section">
        <Container>
          <Typography variant="h4" component="h2" className="section-title">
            User Testimonials
          </Typography>
          <div className="section-divider"></div>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box className="testimonial-card">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar className="testimonial-avatar" src={testimonial1} />
                  <Typography variant="h6" component="h3" className="testimonial-name">
                    Sarah Johnson
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    London, UK
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  "Park-O-Meter saved me so much time and money! I used to spend ages searching for parking in central London, but now I can book in advance and know exactly where I'm going."
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box className="testimonial-card">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar className="testimonial-avatar" src={testimonial2} />
                  <Typography variant="h6" component="h3" className="testimonial-name">
                    James Wilson
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Manchester, UK
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  "As a parking space owner, I've been able to earn extra income from my unused driveway. The platform is incredibly easy to use and the payment system is seamless."
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box className="testimonial-card">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar className="testimonial-avatar" src={testimonial3} />
                  <Typography variant="h6" component="h3" className="testimonial-name">
                    Emily Brown
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Birmingham, UK
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  "I was able to reduce my car insurance by parking in a safer area using Park-O-Meter. The app is intuitive and the customer support is excellent whenever I need assistance."
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box className="cta-section">
        <Container>
          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h4" component="h2" className="cta-title">
                Ready to Transform Your Parking Experience?
              </Typography>
              <Typography variant="body1" className="cta-subtitle" mb={4}>
                Join thousands of users who are saving time and money with Park-O-Meter.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  className="cta-button-primary"
                >
                  Book A Parking Space
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  className="cta-button-secondary"
                >
                  List Your Parking Space
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="footer">
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="h3" className="footer-title">
                Park-O-Meter
              </Typography>
              <Typography variant="body2">
                An on-demand parking solution for urban mobility, making parking safer, more affordable, and environmentally sustainable.
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" component="h3" className="footer-title">
                Company
              </Typography>
              <Typography variant="body2" paragraph>
                <Button className="footer-link">About</Button>
              </Typography>
              <Typography variant="body2" paragraph>
                <Button className="footer-link">Team</Button>
              </Typography>
              <Typography variant="body2">
                <Button className="footer-link">Careers</Button>
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" component="h3" className="footer-title">
                Resources
              </Typography>
              <Typography variant="body2" paragraph>
                <Button className="footer-link">FAQs</Button>
              </Typography>
              <Typography variant="body2" paragraph>
                <Button className="footer-link">Blog</Button>
              </Typography>
              <Typography variant="body2">
                <Button className="footer-link">Support</Button>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="h3" className="footer-title">
                Contact
              </Typography>
              <Typography variant="body2" paragraph>
                Email: info@park-o-meter.com
              </Typography>
              <Typography variant="body2" paragraph>
                Phone: +44 1234 567890
              </Typography>
              <Typography variant="body2">
                University of Hertfordshire, Hatfield, UK
              </Typography>
            </Grid>
          </Grid>
          <Divider className="footer-divider" />
          <Typography variant="body2" className="copyright">
            © {new Date().getFullYear()} Park-O-Meter. A BSc Computer Science Final Year Project by Pasan Nimthake Pitigala Kankanamge Don. Supervised by Paul Morris.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default ParkOMeter;