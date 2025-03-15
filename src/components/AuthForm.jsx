import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login/signup; default to "/map"
  const from = location.state?.from?.pathname || "/map";

  const toggleForm = (e) => {
    e.preventDefault();
    setError("");
    setIsLogin((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to the originally intended route (or default /map)
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to the originally intended route (or default /map)
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 430,
          width: "100%",
          p: 4,
          borderRadius: 2,
        }}
      >
        {isLogin ? (
          <Box component="form" noValidate autoComplete="off" onSubmit={handleLogin}>
            <Typography variant="h4" align="center" gutterBottom>
              Login
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              fullWidth
              margin="normal"
              label="Enter your email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Enter your password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Link
                href="#"
                underline="hover"
                color="primary"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </Link>
            </Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.5 }}
              type="submit"
            >
              Login
            </Button>
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Don't have an account?{" "}
              <Link
                component="button"
                variant="body1"
                onClick={toggleForm}
                underline="hover"
                color="primary"
              >
                Signup
              </Link>
            </Typography>
          </Box>
        ) : (
          <Box component="form" noValidate autoComplete="off" onSubmit={handleSignup}>
            <Typography variant="h4" align="center" gutterBottom>
              Signup
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              fullWidth
              margin="normal"
              label="Enter your email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Create a password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Confirm your password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.5 }}
              type="submit"
            >
              Signup
            </Button>
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Link
                component="button"
                variant="body1"
                onClick={toggleForm}
                underline="hover"
                color="primary"
              >
                Login
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
