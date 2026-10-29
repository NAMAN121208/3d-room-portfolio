import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PanelPreview from './dev/PanelPreview';
import './index.css';

const isDev =
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/dev') ||
    new URLSearchParams(window.location.search).has('dev'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isDev ? <PanelPreview /> : <App />}
  </React.StrictMode>
);
