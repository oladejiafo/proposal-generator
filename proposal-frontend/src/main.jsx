import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from "./AuthProvider";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/brand.css'; // your overrides come *after* Bootstrap

import './index.css'; 
// ReactDOM.createRoot(document.getElementById('root')).render(<App />);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
