import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Checkbox, FormControlLabel } from "@mui/material";
import { useLocation } from "react-router-dom";
import axios from "axios"; // Import axios for data fetching

// TopBar component with dynamic page title and advanced features toggle
function TopBar({ setAdvancedFeatures }) {
  const location = useLocation(); 
  const [pageTitle, setPageTitle] = useState(""); 
  const [user, setUser] = useState(null); 
  const [advancedEnabled, setAdvancedEnabled] = useState(false); 

  // Effect to fetch user data based on the current route
  useEffect(() => {
    const userIdMatch = location.pathname.match(/\/(users|photos)\/(\w+)/); 
    const userId = userIdMatch ? userIdMatch[2] : null;

    // If a userId is found in the route, fetch the user data
    if (userId) {
      axios.get(`/user/${userId}`)
        .then((response) => setUser(response.data)) 
        .catch((error) => console.error("Error fetching user for TopBar:", error)); 
    } else {
      setUser(null); 
    }
  }, [location]); 

  // Effect to set the page title based on the route and user data
  useEffect(() => {
    if (location.pathname.startsWith("/photos") && user) {
      setPageTitle(`Photos of ${user.first_name}`); 
    } else if (location.pathname.startsWith("/users") && user) {
      setPageTitle(`${user.first_name} ${user.last_name}`); 
    } else {
      setPageTitle(""); 
    }
  }, [location, user]); 

  // Toggle handler for advanced features checkbox
  const handleAdvancedToggle = (event) => {
    setAdvancedEnabled(event.target.checked); 
    setAdvancedFeatures(event.target.checked); 
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>Challa Hemantha Krishna</Typography> 
        {pageTitle && <Typography variant="h6">{pageTitle}</Typography>} 
        
        {/* Checkbox for enabling advanced features */}
        <FormControlLabel
          control={(
            <Checkbox
              checked={advancedEnabled} 
              onChange={handleAdvancedToggle} 
              style={{ backgroundColor: 'white', marginLeft: '35px' }} 
            />
          )}
          label="Enable Advanced Features" 
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
