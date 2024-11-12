import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Button,
  Link,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for data fetching

// Component to display a user's photos with optional advanced features
function UserPhotos({ userId, advancedEnabled }) {
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const { photoId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch photos and user data when component mounts or userId/photoId changes
  useEffect(() => {
    // Fetch photos of the user by userId
    axios
      .get(`/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
        if (photoId) {
          // If a photoId is in the URL, find its index
          const index = response.data.findIndex(
            (photo) => photo._id === photoId
          );
          setCurrentIndex(index !== -1 ? index : 0);
        }
      })
      .catch((error) => console.error("Error fetching photos:", error));

    // Fetch user details by userId
    axios
      .get(`/user/${userId}`)
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user:", error));
  }, [userId, photoId]);

  // Navigate to the next photo
  const handleNextPhoto = () => {
    const newIndex = currentIndex + 1;
    if (newIndex < photos.length) {
      setCurrentIndex(newIndex);
      navigate(`/photos/${userId}/${photos[newIndex]._id}`);
    }
  };

  // Navigate to the previous photo
  const handlePreviousPhoto = () => {
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
      navigate(`/photos/${userId}/${photos[newIndex]._id}`);
    }
  };

  if (photos.length === 0) return <CircularProgress />;

  return (
    <Grid container direction="column" alignItems="center" sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Photos of {user ? user.first_name : "User"}{" "}
        {/* Show user's first name if user data is available */}
      </Typography>

      {/* Render advanced view with individual photo navigation if advancedEnabled is true */}
      {advancedEnabled ? (
        <Card sx={{ marginBottom: 3, width: "100%", maxWidth: 500 }}>
          <CardMedia
            component="img"
            image={`/images/${photos[currentIndex].file_name}`} // Display current photo
            alt={`Photo taken on ${new Date(
              photos[currentIndex].date_time
            ).toLocaleString()}`}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Taken on{" "}
              {new Date(photos[currentIndex].date_time).toLocaleString()}{" "}
              {/* Show photo date */}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">Comments:</Typography>
            {/* Display comments if available; otherwise, show a "No comments yet" message */}
            {photos[currentIndex].comments?.length > 0 ? (
              photos[currentIndex].comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <Typography variant="body2">
                    <Link
                      component={RouterLink}
                      to={`/users/${comment.user._id}`}
                    >
                      {comment.user.first_name} {comment.user.last_name}
                    </Link>{" "}
                    commented on {new Date(comment.date_time).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {comment.comment}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </div>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No comments yet.
              </Typography>
            )}
            {/* Buttons to navigate to previous and next photos */}
            <Button onClick={handlePreviousPhoto} disabled={currentIndex === 0}>
              Previous
            </Button>
            <Button
              onClick={handleNextPhoto}
              disabled={currentIndex === photos.length - 1}
            >
              Next
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Render simple view showing all photos at once if advancedEnabled is false
        photos.map((photo) => (
          <Card
            key={photo._id}
            sx={{ marginBottom: 3, width: "100%", maxWidth: 500 }}
          >
            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`} // Display each photo
              alt={`Photo taken on ${new Date(
                photo.date_time
              ).toLocaleString()}`}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Taken on {new Date(photo.date_time).toLocaleString()}{" "}
                {/* Show photo date */}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Comments:</Typography>
              {/* Display comments if available; otherwise, show a "No comments yet" message */}
              {photo.comments?.length > 0 ? (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <Typography variant="body2">
                      <Link
                        component={RouterLink}
                        to={`/users/${comment.user._id}`}
                      >
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>{" "}
                      commented on{" "}
                      {new Date(comment.date_time).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {comment.comment}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                  </div>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No comments yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Grid>
  );
}

export default UserPhotos;
