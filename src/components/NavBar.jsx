import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Container, 
  IconButton, 
  Toolbar, 
  Typography, 
  Button, 
  useMediaQuery, 
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import CarIcon from '@mui/icons-material/DirectionsCar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import '../../styles/global.css';
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  
  // Fetch user details when user is logged in
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`http://localhost:5001/api/users/${currentUser.uid}`);
          if (response.ok) {
            const userData = await response.json();
            setUserDetails(userData);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      } else {
        setUserDetails(null);
      }
    };
    
    fetchUserDetails();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth", { replace: true });
      setAnchorEl(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CarIcon sx={{ mr: 1, color: '#48A6A7' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2973B2' }}>
          Park-O-Meter
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate("/")}>
          <ListItemIcon>
            <HomeIcon sx={{ color: '#48A6A7' }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <LocalParkingIcon sx={{ color: '#48A6A7' }} />
          </ListItemIcon>
          <ListItemText primary="Features" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <HelpIcon sx={{ color: '#48A6A7' }} />
          </ListItemIcon>
          <ListItemText primary="How It Works" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <InfoIcon sx={{ color: '#48A6A7' }} />
          </ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <ContactSupportIcon sx={{ color: '#48A6A7' }} />
          </ListItemIcon>
          <ListItemText primary="Contact" />
        </ListItem>
      </List>
      <Divider />
      {currentUser && (
        <List>
          <ListItem button onClick={() => navigate("/dashboard")}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#48A6A7' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#48A6A7' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <AppBar position="fixed" className="app-bar">
      <Container>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate("/")}
          >
            <CarIcon sx={{ mr: 1 }} /> Park-O-Meter
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton 
                color="inherit" 
                edge="end"
                onClick={handleDrawerToggle}
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <>
              <Button color="inherit" className="nav-button" onClick={() => navigate("/")}>Home</Button>
              <Button color="inherit" className="nav-button">Features</Button>
              <Button color="inherit" className="nav-button">How It Works</Button>
              <Button color="inherit" className="nav-button">About</Button>
              <Button color="inherit" className="nav-button">Contact</Button>
              
              {currentUser ? (
                <>
                  <Button 
                    color="inherit"
                    className="nav-button"
                    onClick={() => navigate("/dashboard")}
                    startIcon={<DashboardIcon />}
                  >
                    Dashboard
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Button
                      onClick={handleProfileMenuOpen}
                      sx={{ 
                        color: 'white', 
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: '20px',
                        padding: '4px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                      endIcon={<KeyboardArrowDownIcon />}
                      startIcon={
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28,
                            bgcolor: '#9ACBD0',
                            color: '#2973B2',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {userDetails?.firstName ? userDetails.firstName[0] : currentUser.email[0].toUpperCase()}
                        </Avatar>
                      }
                    >
                      {userDetails ? `Hello, ${userDetails.firstName}` : 'Account'}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        elevation: 3,
                        sx: { minWidth: 180, mt: 1 }
                      }}
                    >
                      <MenuItem 
                        onClick={() => {
                          navigate('/dashboard');
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <DashboardIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        Dashboard
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  className="signup-button"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;