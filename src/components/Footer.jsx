// Footer.jsx
import React from 'react';
import { Container, Grid, Typography, Box, Divider, Button } from '@mui/material';
import '../../styles/LandingPage.css';

const Footer = () => {
  return (
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
  );
};

export default Footer;
