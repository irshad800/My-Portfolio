import { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);
        onLoginSuccess(data.token, data.username);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Cannot connect to backend server (Ensure node server/index.js is running)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div 
        className="admin-login-card glass"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-login-header">
          <div className="admin-shield-icon">🛡️</div>
          <h2>Admin Portal Access</h2>
          <p>Irshad Portfolio Control Panel & Visitor Analytics</p>
        </div>

        {error && <div className="admin-alert error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter username" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password" 
              required 
            />
          </div>

          <div className="credentials-hint">
            💡 Initial Setup Credentials: Username: <code>admin</code> | Password: <code>admin123</code>
          </div>

          <button type="submit" className="btn btn-primary admin-login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
