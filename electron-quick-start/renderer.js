import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import NFTList from './components/NFTList';
import ArduinoComponent from './components/ArduinoComponent';
import ProfilePage from './Pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/arduinosensor" element={<Layout><ArduinoComponent /></Layout>} />
        <Route path="/nft" element={<Layout><NFTList /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;

