import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function ProtectedRoute() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [username, setUsername] = useState(localStorage.getItem('adminUsername') || 'admin');

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedUsername = localStorage.getItem('adminUsername');
    if (savedToken) {
      setToken(savedToken);
      if (savedUsername) setUsername(savedUsername);
    }
  }, []);

  const handleLoginSuccess = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setToken('');
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard token={token} username={username} onLogout={handleLogout} />;
}
