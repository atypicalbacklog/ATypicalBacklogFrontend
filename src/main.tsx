import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './app/App';
import { ReferenceDataProvider } from './referenceData/ReferenceDataContext';
import { theme } from './app/theme';
import { loadAppConfig, startAppConfigDeployWatch } from './app/AppConfig';

async function bootstrap() {
  try {
    const ready = await loadAppConfig();
    if (!ready) return;
  } catch (error) {
    // If app config cannot be loaded from the backend, fail fast.
    const container = document.getElementById('root');
    if (container) {
      container.innerText = 'Failed to initialize application configuration.';
    }
    console.error(error);
    return;
  }

  startAppConfigDeployWatch();

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
}

void bootstrap();
