import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@mui/material";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const users = useSelector((state) => state.users);
  const [nftCount, setNftCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNftCount = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const timestamp = Date.now(); // Generate a unique timestamp
      const response = await axios.get(
        `${process.env.REACT_APP_URL_ENDPOINT}/users/nftCount/?timestamp=${timestamp}`
      );
      const data = response.data;
  
      // Filter the snapshots based on the current user's firstname
      const snapshots = data.snapshots;
      const filteredSnapshots = snapshots.filter(
        (snapshot) => snapshot.firstname === users.firstname
      );
      const count = filteredSnapshots.length;
  
      // Set the NFT count
      setNftCount(count);
    } catch (error) {
      setError("Error fetching NFT count");
    }
  
    setIsLoading(false);
  };
  

  useEffect(() => {
    fetchNftCount();
  }, [users]);

  return (
    <Container>
      <Typography variant="h3">Profile Page</Typography>
      <Typography variant="h5">First Name: {users.firstname}</Typography>
      <Typography variant="h5">Last Name: {users.lastname}</Typography>
      <Typography variant="h5">Email: {users.email}</Typography>

      {isLoading ? (
        <Typography variant="h5">Loading NFT count...</Typography>
      ) : error ? (
        <Typography variant="h5">{error}</Typography>
      ) : (
        <Typography variant="h5">NFT Count: {nftCount}</Typography>
      )}
    </Container>
  );
};

export default ProfilePage;
