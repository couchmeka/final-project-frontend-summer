import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import axios from "axios";

const NFTCard = ({ nft, onDelete }) => {
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_URL_ENDPOINT}/users/delete/${nft._id}`
      );
      if (response.status === 200) {
        console.log("NFT snapshot deleted successfully");
        onDelete(nft._id); // Trigger the callback function to update the NFT list
      } else {
        console.error("Failed to delete NFT snapshot");
      }
    } catch (error) {
      console.error("Error deleting NFT snapshot:", error.message);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {nft.name || "No Name"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {nft.description || "No Description"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created By: {nft.firstname || "Unknown"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Timestamp: {new Date(nft.timestamp).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sensor Data: {nft.data || "No Sensor Data"}
        </Typography>
        <Button variant="contained" onClick={handleDelete}>
          Delete
        </Button>
      </CardContent>
    </Card>
  );
};

export default NFTCard;



