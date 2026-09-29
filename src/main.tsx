import React from 'react';
import ReactDOM from 'react-dom/client';
import { FinFamProvider } from './context/FinFamContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FinFamProvider>
      <App />
    </FinFamProvider>
  </React.StrictMode>
);
