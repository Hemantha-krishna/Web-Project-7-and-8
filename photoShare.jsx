import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";

// Component to display user details based on the userId from the URL
function UserDetailRoute() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}

// Component to display user photos, with an option for advanced view based on a prop
function UserPhotosRoute({ advancedEnabled }) {
  const { userId, photoId } = useParams();
  return (
    <UserPhotos
      userId={userId}
      photoId={photoId}
      advancedEnabled={advancedEnabled}
    />
  );
}

// Main application component
function PhotoShare() {
  const [advancedEnabled, setAdvancedEnabled] = useState(false); // State to toggle advanced photo features

  return (
    <HashRouter>
      <div>
        {/* Layout for the main content */}
        <Grid container spacing={2}>
          {/* TopBar section */}
          <Grid item xs={12}>
            <TopBar setAdvancedFeatures={setAdvancedEnabled} />
          </Grid>

          <div className="main-topbar-buffer" />

          {/* Left sidebar with user list */}
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList advancedEnabled={advancedEnabled} />{" "}
              {/* Pass advancedEnabled */}
            </Paper>
          </Grid>

          {/* Main content area */}
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              {/* Define routing for different app views */}
              <Routes>
                {/* Route for displaying user details */}
                <Route path="/users/:userId" element={<UserDetailRoute />} />

                {/* Routes for displaying user photos, with advanced features toggle */}
                <Route
                  path="/photos/:userId"
                  element={
                    <UserPhotosRoute advancedEnabled={advancedEnabled} />
                  }
                />
                <Route
                  path="/photos/:userId/:photoId"
                  element={
                    <UserPhotosRoute advancedEnabled={advancedEnabled} />
                  }
                />

                {/* Route for displaying list of users */}
                <Route path="/users" element={<UserList />} />

                {/*Route for displaying user comments */}
                <Route
                  path="/users/:userId/comments"
                  element={<UserComments />}
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

// Render the PhotoShare component into the DOM
const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
