import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ArduinoCard = styled(Card)(({ theme }) => ({
  width: "18rem",
  margin: theme.spacing(1),
}));

function ArduinoComponent() {
  const [arduinoData, setArduinoData] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [nftData, setNftData] = useState(
    Array(5).fill({ name: "", description: "" })
  );
  const users = useSelector((state) => state.users);
  const navigate = useNavigate();

  // Open serial ports
  useEffect(() => {
    async function listSerialPorts() {
      const ports = await window.Electron.listSerialPorts();
      setAvailablePorts(ports);
    }
    listSerialPorts();
  }, []);

  //Populate Sensor data
  let cleanupArduinoData;

  useEffect(() => {
    const handleArduinoData = (data) => {
      if (data) {
        setArduinoData((prevData) => [data, ...prevData.slice(0, 5)]);
      }
    };

    // Start listening for arduino-data event
    cleanupArduinoData = window.Electron.onArduinoData(handleArduinoData);

    // Function to fetch new data
    const fetchData = () => {
      // Perform the data fetching logic here
    };

    // Fetch new data initially
    fetchData();

    // Set up the interval to fetch new data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    // Clean up the event listener and interval when the component unmounts
    return () => {
      if (cleanupArduinoData) cleanupArduinoData();
      clearInterval(interval);
    };
  }, []);

  // Navigate to NFT function
  // Navigate to NFT function
  const navigateToNFT = () => {
    if (arduinoData.length > 0 && isConnected) {
      disconnectArduino().then((result) => {
        if (result.success) {
          console.log("Arduino disconnected successfully.");
        } else {
          console.error("Unable to disconnect Arduino.");
        }
      });
    } else if (!isConnected) {
      console.log("Arduino is not connected.");
    } else {
      console.error(
        "Unable to navigate to NFT page. Arduino is still connected or no data available."
      );
    }
    navigate("/nft").then(() => {
      window.location.reload();
    });
  };

  // Function to connect to Arduino Uno board based on the selected port
  async function connectToArduino() {
    if (!isConnected) {
      console.log("Selected Port:", selectedPort);
      const result = await window.Electron.connectArduino(selectedPort);

      if (result.success) {
        setIsConnected(true);
        console.log(result);
      }
    }
  }

  // Async function to disconnect from Arduino
  async function disconnectArduino() {
    return new Promise(async (resolve, reject) => {
      if (isConnected) {
        try {
          const result = await window.Electron.disconnectArduino();
          if (result.success) {
            setIsConnected(false);
            resolve(result);
          } else {
            console.error(`Error disconnecting from Arduino: ${result.error}`);
            reject(result);
          }
        } catch (error) {
          console.error(`Error disconnecting from Arduino: ${error.message}`);
          reject({ success: false, error: error.message });
        }
      } else {
        // If not connected, resolve with a success message
        resolve({ success: true, message: "Arduino not connected." });
      }
    });
  }

  // Function to create the snapshot from the arduino data and from the signed-in user
  async function createNFTSnapshot(index) {
    console.log("Users:", users);
    console.log("Firstname:", users.firstname);
    if (arduinoData.length > 0) {
      const snapshot = {
        user: users._id,
        firstname: users.firstname,
        timestamp: Date.now(),
        data: arduinoData[index],
        name: nftData[index].name,
        description: nftData[index].description,
      };

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_URL_ENDPOINT}/users/nft-snapshot`,
          { nft: snapshot }
        );

        if (response.status === 200) {
          console.log("NFT snapshot stored successfully");
          await disconnectArduino();
          navigateToNFT();
        } else {
          console.error("Failed to store NFT snapshot");
        }
      } catch (error) {
        console.error(
          "Error occurred while storing NFT snapshot:",
          error.message
        );
      }
    } else {
      console.error("No data available to create an NFT snapshot");
    }
  }

  return (
    <div>
      <br />

      <Container>
        <Typography
          variant="h3"
          color="black"
          align="center"
          style={{ fontWeight: "bold" }}
        >
          Arduino Data
        </Typography>
        <Grid container spacing={2}>
          {arduinoData.slice(0, 4).map((item, index) => {
            const labels = ["Sound", "Light", "Humidity", "Temperature"];
            return (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <ArduinoCard>
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="div"
                      style={{ color: "blue" }}
                    >
                      {labels[index]}
                    </Typography>
                    <Typography variant="body2" style={{ color: "black" }}>
                      {item}
                    </Typography>
                    <TextField
                      label="NFT Name"
                      value={nftData[index].name}
                      onChange={(e) => {
                        const updatedNftData = [...nftData];
                        updatedNftData[index] = {
                          ...updatedNftData[index],
                          name: e.target.value,
                        };
                        setNftData(updatedNftData);
                      }}
                    />
                    <TextField
                      label="NFT Description"
                      value={nftData[index].description}
                      onChange={(e) => {
                        const updatedNftData = [...nftData];
                        updatedNftData[index] = {
                          ...updatedNftData[index],
                          description: e.target.value,
                        };
                        setNftData(updatedNftData);
                      }}
                    />
                  </CardContent>

                  <CardActions>
                    <Button
                      onClick={() => createNFTSnapshot(index)}
                      disabled={!isConnected}
                    >
                      Create NFT Snapshot
                    </Button>
                  </CardActions>
                </ArduinoCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <div style={{ display: "flex", alignItems: "center" }}>
        <label htmlFor="portSelector"></label>
        <Select
          id="portSelector"
          value={selectedPort}
          onChange={(e) => setSelectedPort(e.target.value)}
        >
          <MenuItem value="" disabled>
            -- Select a port --
          </MenuItem>
          {availablePorts.map((port) => (
            <MenuItem key={port} value={port}>
              {port}
            </MenuItem>
          ))}
        </Select>

        <Button
          onClick={connectToArduino}
          disabled={!selectedPort || isConnected}
        >
          Connect
        </Button>
        <Button onClick={disconnectArduino} disabled={!isConnected}>
          Disconnect
        </Button>
      </div>
    </div>
  );
}

export default ArduinoComponent;
