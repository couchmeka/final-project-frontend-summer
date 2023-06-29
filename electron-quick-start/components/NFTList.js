import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Select, MenuItem } from "@mui/material";
import NFTCard from "../Pages/NFTCard";
import { useSelector } from "react-redux";

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [sortedNfts, setSortedNfts] = useState([]);
  const [sortOption, setSortOption] = useState("name"); // Default sorting option
  const users = useSelector((state) => state.users);

  useEffect(() => {
    const fetchNfts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_URL_ENDPOINT}/users/nftList`);
        const data = response.data;
        console.log(data); // Check the response data
        setNfts(data.snapshots); // Update the state with the correct data property
      } catch (error) {
        console.error("Error fetching NFT snapshots:", error.message);
      }
    };

    fetchNfts();
  }, []);

  useEffect(() => {
    sortNfts(); // Sort the nfts whenever the sortOption changes
  }, [sortOption, nfts, users.firstname]);

  const sortNfts = () => {
    const sorted = [...nfts]; // Create a copy of the nfts array

    // Sort the array based on the selected sort option
    switch (sortOption) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "timestamp":
        sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case "data":
        sorted.sort((a, b) => a.data.localeCompare(b.data));
        break;
      default:
        break;
    }

    // Filter out NFTs with firstname not matching the user's firstname
    const userNfts = sorted.filter((nft) => nft.firstname === users.firstname);

    setSortedNfts(userNfts);
  };

  const handleDeleteNFTSnapshot = (snapshotId) => {
    // Update the nfts state to remove the deleted snapshot
    setNfts((prevNfts) => prevNfts.filter((nft) => nft._id !== snapshotId));
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <Container>
      <Select value={sortOption} onChange={handleSortOptionChange}>
        <MenuItem value="name">Sort by Name</MenuItem>
        <MenuItem value="timestamp">Sort by Timestamp</MenuItem>
        <MenuItem value="data">Sort by Data</MenuItem>
      </Select>

      <Grid container spacing={4}>
        {sortedNfts.map((nft) => (
          <Grid key={nft._id} item xs={12} sm={6} md={4} lg={3}>
            <NFTCard nft={nft} onDelete={handleDeleteNFTSnapshot} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default NFTList;


