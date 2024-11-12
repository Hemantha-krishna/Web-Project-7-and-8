import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Container,
  CardActionArea,
} from "@mui/material";
import axios from "axios";

function UserComments() {
  const { userId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserAndComments = async () => {
      setLoading(true);
      setError(null);

      // Check local storage for cached comments
      const cachedComments = localStorage.getItem(`comments_${userId}`);
      if (cachedComments) {
        setComments(JSON.parse(cachedComments));
        setLoading(false);
        return;
      }

      try {
        // Fetch user data and comments in parallel
        const [userResponse, statsResponse] = await Promise.all([
          axios.get(`/user/${userId}`),
          axios.get(`/user/${userId}/stats`),
        ]);

        setUserData(userResponse.data);
        const fetchedComments = statsResponse.data.comments || [];
        setComments(fetchedComments);

        // Store the comments in local storage
        localStorage.setItem(
          `comments_${userId}`,
          JSON.stringify(fetchedComments)
        );
      } catch (fetchError) {
        console.error("Failed to fetch data:", fetchError);
        setError(
          fetchError.response?.data?.message || "Failed to fetch comments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndComments();
  }, [userId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Comments by {userData?.first_name} {userData?.last_name}
      </Typography>

      {comments.length === 0 ? (
        <Alert severity="info">
          This user hasn&apos;t made any comments yet.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comments.map((comment) => (
            <Card
              key={comment._id}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                overflow: "hidden",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={`/photos/${comment.photo_id}`}
                onClick={() => console.log("Bubble clicked")}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <CardMedia
                  component="img"
                  image={`/images/${comment.file_name}`}
                  alt="Photo thumbnail"
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    height: { xs: 200, sm: 200 },
                    objectFit: "cover",
                  }}
                />
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      whiteSpace: "pre-wrap",
                      color: "text.primary",
                    }}
                  >
                    {comment.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.date_time).toLocaleString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default UserComments;
