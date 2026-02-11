import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './app/App';
import { ReferenceDataProvider } from './referenceData/ReferenceDataContext';
import { theme } from './app/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReferenceDataProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ReferenceDataProvider>
    </ThemeProvider>
  </React.StrictMode>
);
