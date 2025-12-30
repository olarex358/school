import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// 1️⃣ Get the root element from index.html
const container = document.getElementById('root');

// Safety check (helps beginners)
if (!container) {
  console.error('❌ Root container not found. Check public/index.html');
} else {
  // 2️⃣ Create React root (React 18)
  const root = ReactDOM.createRoot(container);

  // 3️⃣ Render the app
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// 🚫 Service Worker is intentionally DISABLED during development
// We will enable it later after fixing all bugs
