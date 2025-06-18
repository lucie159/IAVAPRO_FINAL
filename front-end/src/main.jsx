import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // ← C'est ici que l’app est branchée
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
