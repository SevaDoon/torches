import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Content and scoring self-check. Dev only — it is tree-shaken out of the build.
if (import.meta.env.DEV) {
  void import('./data/validate').then((m) => m.runSelfCheck());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
