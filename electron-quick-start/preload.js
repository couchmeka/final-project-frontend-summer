/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */


// preload.js
// preload.js
const { contextBridge, ipcRenderer } = require('electron');



let nonce; // Store nonce here

// Listen for nonce from main process
ipcRenderer.on('nonce', (event, value) => {
  nonce = value;
});

contextBridge.exposeInMainWorld('Electron', {
  listSerialPorts: async () => {
    return await ipcRenderer.invoke('list-serial-ports');
  },
  connectArduino: async (portName) => {
    return await ipcRenderer.invoke('connect-arduino', portName);
  },
  disconnectArduino: async () => {
    return await ipcRenderer.invoke('disconnect-arduino');
  },
  getArduinoDataArray: () => {
    return ipcRenderer.invoke('get-arduino-data-array');
  },
  onArduinoData: (callback) => {
    ipcRenderer.on('arduino-data', (event, data) => callback(data));

    // Return a cleanup function that removes the listener
    return () => {
      ipcRenderer.removeListener('arduino-data', callback);
    };
  },
  getNonce: () => nonce, // Expose the nonce
});
