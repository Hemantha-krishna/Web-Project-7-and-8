import React, { useEffect, useState } from "react";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios for data fetching
import "./styles.css";

// Component to display detailed information of a user
function UserDetail({ userId }) {
  const [user, setUser] = useState(null);

  // useEffect to fetch user data when the component mounts or userId changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/user/${userId}`); // Use axios.get
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!user) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  // Render user details once the data is available
  return (
    <div className="user-detail">
      {/* Display user's full name */}
      <Typography variant="h4">
        {user.first_name} {user.last_name}
      </Typography>

      {/* Display user's occupation */}
      <Typography variant="body1">
        <strong>Occupation:</strong> {user.occupation}
      </Typography>

      {/* Display user's location */}
      <Typography variant="body1">
        <strong>Location:</strong> {user.location}
      </Typography>

      {/* Display user's description */}
      <Typography variant="body1" style={{ marginBottom: "20px" }}>
        <strong>Description:</strong> {user.description}
      </Typography>

      {/* Button to navigate to user's photos page */}
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/photos/${user._id}`}
      >
        View {user.first_name}&apos;s Photos{" "}
        {/* Button label with user's first name */}
      </Button>
    </div>
  );
}

export default UserDetail;
