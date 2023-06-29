import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ThemeProvider } from '@mui/system';
import theme from './theme/theme';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import store from './redux/store';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '@emotion/cache';
import App from './renderer';

const nonce = window.Electron.getNonce();

// Client-side nonce generation function
const generateNonce = () => {
  var array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

const emotionCache = createEmotionCache({
  nonce: nonce,
});

ReactDOM.render(
  <React.StrictMode>
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
