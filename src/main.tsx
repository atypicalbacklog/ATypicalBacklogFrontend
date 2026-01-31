import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { ReferenceDataProvider } from './referenceData/ReferenceDataContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReferenceDataProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReferenceDataProvider>
  </React.StrictMode>
);
