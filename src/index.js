// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { DataProvider } from './context/DataContext'; // Import DataProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider> {/* Wrap the App with DataProvider */}
        <App />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
