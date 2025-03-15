import React from "react";
import { 
  AppBar, 
  Container, 
  IconButton, 
  Toolbar, 
  Typography, 
  Button, 
  useMediaQuery, 
  useTheme 
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import CarIcon from '@mui/icons-material/DirectionsCar';
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AppBar position="fixed" className="app-bar">
      <Container>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            <CarIcon sx={{ mr: 1 }} /> Park-O-Meter
          </Typography>
          {isMobile ? (
            <IconButton color="inherit">
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              <Button color="inherit" className="nav-button">Home</Button>
              <Button color="inherit" className="nav-button">Features</Button>
              <Button color="inherit" className="nav-button">How It Works</Button>
              <Button color="inherit" className="nav-button">About</Button>
              <Button color="inherit" className="nav-button">Contact</Button>
              {currentUser ? (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  className="signup-button"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
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
