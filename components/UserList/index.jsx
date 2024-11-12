import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

function UserList({ advancedEnabled }) {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await axios.get("/user/list");
        const userList = response.data;

        if (advancedEnabled) {
          const userStatsPromises = userList.map(async (user) => {
            const statsResponse = await axios.get(`/user/${user._id}/stats`);
            return { ...user, ...statsResponse.data };
          });
          const usersWithStats = await Promise.all(userStatsPromises);
          setUsers(usersWithStats);
        } else {
          setUsers(userList);
        }
      } catch (error) {
        console.error("Failed to fetch user list:", error);
      }
    };

    fetchUserList();
  }, [advancedEnabled]);

  return (
    <div>
      <Typography variant="h6">User List</Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem button component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              {advancedEnabled && (
                <div
                  style={{ display: "flex", gap: "10px", marginLeft: "10px" }}
                >
                  <Badge
                    badgeContent={user.photoCount}
                    color="success"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/photos/${user._id}`);
                    }}
                    style={{ cursor: "pointer" }}
                  />

                  <Badge
                    badgeContent={user.commentCount}
                    color="error"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/users/${user._id}/comments`);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
