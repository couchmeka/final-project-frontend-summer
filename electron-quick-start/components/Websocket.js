//This is for the sensor values to be connected to a React Native Application. 


const WebSocket = require('ws');
const Store = require('electron-store');
const store = new Store();

const createWebSocketServer = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Read the arduino data array from the store
    const arduinoDataArray = store.get('arduinoDataArray') || [];
    console.log(`From The Store${arduinoDataArray} The End`);

    // Filter out empty arrays and objects from the arduino data array
    const filteredArray = arduinoDataArray.filter((item) => {
      if (Array.isArray(item)) {
        return item.length > 0;
      } else if (typeof item === 'object' && item !== null) {
        return Object.keys(item).length > 0;
      } else if (typeof item === 'string' && item.trim() !== '') {
        return true;
      }
      return false;
    });

    // Send the non-empty data to the WebSocket client
    ws.send(JSON.stringify(filteredArray));

    // Listen for changes to the arduino data array in the store
    store.onDidChange('arduinoDataArray', (newValue) => {
      // Filter out empty arrays and objects from the updated arduino data array
      const updatedFilteredArray = newValue.filter((item) => {
        if (Array.isArray(item)) {
          return item.length > 0;
        } else if (typeof item === 'object' && item !== null) {
          return Object.keys(item).length > 0;
        } else if (typeof item === 'string' && item.trim() !== '') {
          return true;
        }
        return false;
      });

      // Send the updated non-empty data to the WebSocket client
      ws.send(JSON.stringify(updatedFilteredArray));
    });
  });
};

module.exports = createWebSocketServer;
