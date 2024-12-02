import React from "react";
import {AppBar, Container, IconButton, Toolbar, Box, Typography} from "@mui/material"
import Menu from '@mui/icons-material/Menu';


const NavBar = () => {
    return (
        <AppBar>
            <Container maxwidth = "lg">
                <Toolbar disableGutters>
                    <Box sx = {{mr:1}}>
                        <IconButton size="large" color="inherit">
                            <Menu/>
                        </IconButton>
                    </Box>
                    <Typography
                    variant="h6"
                    component="h1"
                    noWrap
                    sx={{flexGrow: 1, display: {xs: "none", md: "flex"}}}
                    >
                        Welcome to Park-O-Meter
                    </Typography>
                    <Typography
                    variant="h6"
                    component="h1"
                    noWrap
                    sx={{flexGrow: 1, display: {xs: "flex", md: "none"}}}
                    >
                        Park-O-Meter
                    </Typography>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NavBar