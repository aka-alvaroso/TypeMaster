import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState(false);
  const instanceRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const raw = sessionStorage.getItem('userData');
    if (!token || !raw || sessionStorage.getItem('loggedIn') !== 'true') return;

    const userData = JSON.parse(raw);

    const socketUrl = new URL(import.meta.env.VITE_API_URL).origin;
    const s = io(socketUrl, {
      auth: { token, username: userData.username },
      autoConnect: true,
      reconnection: true,
    });

    instanceRef.current = s;

    // Solo exponer el socket una vez que la conexión está establecida
    s.on('connect', () => {
      setSocket(s);
      setConnected(true);
    });

    s.on('disconnect', () => {
      setSocket(null);
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error('[Socket] Error de conexión:', err.message);
      setSocket(null);
      setConnected(false);
      if (err.message === 'Invalid token' || err.message === 'Unauthorized') {
        setAuthError(true);
      }
    });

    return () => {
      s.disconnect();
      instanceRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, authError }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = { children: PropTypes.node.isRequired };

export const useSocket = () => useContext(SocketContext);
