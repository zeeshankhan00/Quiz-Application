import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { consumeOAuthRedirect } from './auth.js';
import './App.css';

const initialError = consumeOAuthRedirect();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App initialError={initialError} /></React.StrictMode>,
);
