// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { Readline } = require("@serialport/parser-readline");
const createWebSocketServer = require("./components/websocket.js");
const crypto = require("crypto");
const Store = require("electron-store");
const store = new Store();
const axios = require("axios");
let arduinoPort = null;
let arduinoDataArray = [];
let mainWindow = null;

// Generate a nonce
const nonce = crypto.randomBytes(16).toString("hex");

function createWindow() {
  // Remove the 'const' keyword from the following line
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the React app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Make a request to the Express server on port 4000.
  axios
    .get("http://localhost:4000/api/users")
    .then((response) => {
      console.log("Received data from Express server:", response.data);
      // Send the data to the renderer process if needed.
      mainWindow.webContents.send("express-data", response.data);
    })
    .catch((error) => {
      console.error("Error accessing Express server:", error);
    });

  // Send the initial data to the renderer process
  mainWindow.webContents.send("arduino-data", arduinoDataArray.slice(0, 5));

  // Return the created window
  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createWindow(); // Call the createWindow function and assign the returned value to mainWindow

  // Set up the interval after creating the window
  if (!sendDataInterval && mainWindow) {
    sendDataInterval = setInterval(() => {
      console.log(
        "Interval triggered, checking arduinoDataArray length:",
        arduinoDataArray.length
      );

      if (arduinoDataArray.length >= 5) {
        const dataToSend = arduinoDataArray.slice(0, 5); // Get the first 5 data pieces
        console.log("Sending data to renderer:", dataToSend);
        mainWindow.webContents.send("arduino-data", dataToSend);

        // Remove the first 5 data pieces from the array
        arduinoDataArray.splice(0, 5);
      }
    }, 2 * 60 * 1000); // 2 minutes in milliseconds
  }
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Activate the app when clicked on the dock icon (macOS).
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//require("./Components/Websocket.js");

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle("list-serial-ports", async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map((port) => port.path || port.comName);
  } catch (err) {
    console.error("Error listing serial ports:", err);
    return [];
  }
});

let sendDataInterval = null; // Declare a variable to store the interval reference
let parser = null; // Declare a variable to store the parser reference

//connect to arduino handle 

ipcMain.handle("connect-arduino", async (event, portName) => {
  event.preventDefault();
  try {
    if (!arduinoPort || !arduinoPort.isOpen) {
      arduinoPort = new SerialPort({
        path: portName,
        baudRate: 9600,
        //  parser: new ReadlineParser("\n")
      });
    }
    arduinoPort.on("open", () => {
      console.log("Arduino port opened:", portName);
    });

    arduinoPort.on("close", () => {
      console.log("Arduino port closed:", portName);
      // Prompt the user to reconnect to the device and attempt to reconnect when the user confirms
      if (
        confirm(
          "The Arduino device has been disconnected. Do you want to reconnect?"
        )
      ) {
        // Clear any existing interval
        clearInterval(sendDataInterval);

        // Re-initialize the arduinoPort object
        arduinoPort = null;
        arduinoPort = new SerialPort({
          path: portName,
          baudRate: 9600,
          //  parser: new ReadlineParser("\n")
        });

        // Re-initialize the parser object
        parser = null;
        parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        // Re-attach the event listener for the "data" event
        parser.on("data", (data) => {
          console.log(data);
          arduinoDataArray.unshift(data); // Push the new data to the front of the arduinoDataArray

          if (arduinoDataArray.length > 7) {
            arduinoDataArray.pop();
          }

          // Update the stored arduinoDataArray
          store.set("arduinoDataArray", arduinoDataArray);

          // Send the data to the renderer process
          event.sender.send("arduino-data", data);
          // Send the data to the WebSocket clients
        });

        // Re-initialize the sendDataInterval
        sendDataInterval = setInterval(() => {
          console.log(
            "Interval triggered, checking arduinoDataArray length:",
            arduinoDataArray.length
          ); // Add this line

          if (arduinoDataArray.length >= 5) {
            const dataToSend = arduinoDataArray.slice(0, 5); // Get the first 5 data pieces
            console.log("Sending data to renderer:", dataToSend);
            mainWindow.webContents.send("arduino-data", dataToSend);

            // Remove the first 5 data pieces from the array
            arduinoDataArray.splice(0, 5);
          }
        }, 2 * 60 * 1000); // 2 minutes in milliseconds
      }
    });

    if (!parser) {
      // const Readline = SerialPort.parsers.Readline;
      parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

      parser.on("data", (data) => {
        console.log(`New Data Start${data}`);
        console.log(data.length);
        arduinoDataArray.unshift(data); // Push the new data to the front of the arduinoDataArray
        if (arduinoDataArray.length > 7) {
          arduinoDataArray.pop();
        }
        console.log(arduinoDataArray.length);
        // Update the stored arduinoDataArray
        store.set("arduinoDataArray", arduinoDataArray);

        // Send the data to the renderer process
        event.sender.send("arduino-data", data);
        // Send the data to the WebSocket clients
      });
    }

    // Set up an interval to send the data to the renderer process every 2 minutes
    if (!sendDataInterval) {
      sendDataInterval = setInterval(() => {
        console.log(
          "Interval triggered, checking arduinoDataArray length:",
          arduinoDataArray.length
        );

        if (arduinoDataArray.length >= 5) {
          const dataToSend = arduinoDataArray.slice(0, 5); // Get the first 5 data pieces
          console.log("Sending data to renderer:", dataToSend);
          mainWindow.webContents.send("arduino-data", dataToSend);

          // Remove the first 5 data pieces from the array
          arduinoDataArray.splice(0, 5);
        }
      }, 2 * 60 * 1000); // 2 minutes in milliseconds
    }

    return { success: true };
  } catch (err) {
    console.error("Error connecting to Arduino:", err);
    return { success: false, error: err.message };
  }
});

// Handle a "disconnect-arduino" event using ipcMain
ipcMain.handle("disconnect-arduino", async (event) => {
  try {
    // Delete the "arduinoDataArray" key from local storage using store.delete()
    store.delete("arduinoDataArray");
    // Clear all remaining data from local storage using store.clear()
    store.clear();
    // Clear the cache for the default session using session.defaultSession.clearCache()
    session.defaultSession.clearCache();

    // Get the first window of the app using BrowserWindow.getAllWindows()[0]
    const win = BrowserWindow.getAllWindows()[0];
    // Get the web contents session for the window using win.webContents.session
    const ses = win.webContents.session;

    // Clear all cached data for the session
    await ses.clearCache();
    await ses.clearStorageData();

    // If there is an open serial port connection to the Arduino device
    if (arduinoPort && arduinoPort.isOpen) {
      // Remove all "close" event listeners attached to the serial port using arduinoPort.removeAllListeners("close")
      arduinoPort.removeAllListeners("close");
      // Remove the parser from the SerialPort instance using arduinoPort.unpipe(parser)
      arduinoPort.unpipe(parser);
      // Close the connection using await arduinoPort.close()
      await arduinoPort.close();
      // Set arduinoPort to null after closing the connection
      arduinoPort = null;
    }

    // If there is a running interval for sending data
    if (sendDataInterval) {
      // Clear the interval using clearInterval(sendDataInterval)
      clearInterval(sendDataInterval);
      // Set sendDataInterval to null
      sendDataInterval = null;
    }

    // Log a message indicating success
    console.log("Disconnected from Arduino successfully.");

    // Return an object with a "success" property set to true
    return { success: true };
  } catch (err) {
    // If there was an error during the process, return an object with a "success" property set to false and an "error" property set to the error message
    console.error("Error disconnecting from Arduino:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("get-arduino-data-array", (event) => {
  return Promise.resolve(arduinoDataArray);
});
