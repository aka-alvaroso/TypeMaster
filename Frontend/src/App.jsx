import './index.css';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import History from './pages/History';
import TestPreview from './pages/TestPreview';
import Rankings from './pages/Rankings';
import Settings from './pages/Settings';
import Multiplayer from './pages/Multiplayer';
import MultiplayerRoom from './pages/MultiplayerRoom';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TerminosUso from './pages/TerminosUso';

function App() {
  const [sound, setSound] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Home sound={sound} setSound={setSound} />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile/:username" element={<Profile sound={sound} setSound={setSound} />} />
      <Route path="/history/:username" element={<History sound={sound} setSound={setSound} />} />
      <Route path="/test/:id" element={<TestPreview sound={sound} setSound={setSound} />} />
      <Route path="/rankings" element={<Rankings sound={sound} setSound={setSound} />} />
      <Route path="/settings" element={<Settings sound={sound} setSound={setSound} />} />
      <Route path="/multiplayer" element={<Multiplayer sound={sound} setSound={setSound} />} />
      <Route path="/multiplayer/:code" element={<MultiplayerRoom sound={sound} setSound={setSound} />} />
      <Route path="/politica" element={<PoliticaPrivacidad />} />
      <Route path="/terminos" element={<TerminosUso />} />
    </Routes>
  );
}

export default App;
