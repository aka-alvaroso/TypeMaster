import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import App from './App.jsx';
import './index.css';
import './i18n';

createRoot(document.getElementById('root')).render(
  <Router basename="/keypro">
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </Router>,
);
