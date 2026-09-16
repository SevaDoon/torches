import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Engine self-check. Dev only — it is tree-shaken out of the build.
if (import.meta.env.DEV) {
  void import('./data/selfcheck').then((m) => m.runSelfCheck());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
