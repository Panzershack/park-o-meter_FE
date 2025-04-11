import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Alert, 
  InputAdornment, 
  IconButton,
  Grid
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person } from '@mui/icons-material';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!isLogin && passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    if (!isLogin && (!firstNameRef.current.value || !lastNameRef.current.value)) {
      return setError('Please provide both first and last name');
    }
    
    try {
      setError('');
      setLoading(true);
      
      if (isLogin) {
        // Login
        await login(emailRef.current.value, passwordRef.current.value);
        navigate('/');
      } else {
        // Signup
        const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
        
        // After successful Firebase signup, create user in MongoDB
        const userData = {
          firebaseUID: userCredential.user.uid,
          email: emailRef.current.value,
          firstName: firstNameRef.current.value,
          lastName: lastNameRef.current.value,
          rentedSpots: 0,
          listingCount: 0
        };
        
        // Send user data to backend
        const response = await fetch('http://localhost:5001/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create user profile');
        }
        
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        bgcolor: '#F2EFE7'
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: '#2973B2', 
              fontWeight: 700,
              textAlign: 'center',
              mb: 3
            }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    inputRef={firstNameRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#48A6A7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    inputRef={lastNameRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#48A6A7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            )}
            
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              margin="normal"
              inputRef={emailRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#48A6A7' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              margin="normal"
              inputRef={passwordRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#48A6A7' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {!isLogin && (
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                margin="normal"
                inputRef={passwordConfirmRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#48A6A7' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3,
                mb: 2,
                py: 1.5,
                bgcolor: '#48A6A7',
                '&:hover': {
                  bgcolor: '#2973B2',
                },
                fontSize: '1rem',
                fontWeight: 600 
              }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            
            <Typography 
              variant="body2" 
              align="center" 
              color="text.secondary" 
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}