import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

// Helper function to convert ISO country code to flag emoji
function getCountryFlag(code) {
  if (!code || code === 'UN' || code.length !== 2) return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function AdminDashboard({ token, username, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, inbox, settings
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    stats: { totalVisits: 0, totalMessages: 0, unreadMessages: 0, uniqueCountriesCount: 0 },
    countries: [],
    recentVisitors: []
  });
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Change Password Form State
  const [newUsername, setNewUsername] = useState(username || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchMessages()]);
      setLoading(false);
    };
    loadAll();
  }, [token]);

  const toggleMessageRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMessages();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error updating message:', err);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedMessage && selectedMessage._id === id) setSelectedMessage(null);
        fetchMessages();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleCredentialsUpdate = async (e) => {
    e.preventDefault();
    setSettingsStatus('updating');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newUsername, currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsStatus('success');
        setCurrentPassword('');
        setNewPassword('');
        localStorage.setItem('adminUsername', data.username);
      } else {
        setSettingsStatus(data.message || 'Error updating credentials');
      }
    } catch (err) {
      setSettingsStatus('Server error updating credentials');
    }
  };

  const totalVisits = analyticsData.stats.totalVisits || 1;

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="brand-dot">⚡</span> Irshad Admin
        </div>
        <div className="admin-user-badge">
          Logged in as <strong>{username || 'admin'}</strong>
        </div>

        <nav className="admin-nav-links">
          <button 
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Country Analytics & Visitors
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            📬 Contact Inbox ({analyticsData.stats.unreadMessages > 0 ? `🔴 ${analyticsData.stats.unreadMessages}` : messages.length})
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Credentials & Password
          </button>
        </nav>

        <button className="admin-logout-btn" onClick={onLogout}>
          🚪 Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1>Portfolio Executive Dashboard</h1>
            <p>Real-time MongoDB Visitor Geolocation & Contact Message Control</p>
          </div>
          <button className="btn btn-outline" onClick={() => { fetchAnalytics(); fetchMessages(); }}>
            🔄 Refresh Data
          </button>
        </header>

        {loading ? (
          <div className="admin-loading">
            <span className="spinner" /> Loading MongoDB Analytics...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: VISITOR & COUNTRY ANALYTICS */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {/* Metric Summary Cards */}
                <div className="admin-metrics-grid">
                  <div className="metric-card glass">
                    <span className="metric-icon">👁️</span>
                    <div>
                      <h3>{analyticsData.stats.totalVisits}</h3>
                      <p>Total Pageviews</p>
                    </div>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-icon">🌍</span>
                    <div>
                      <h3>{analyticsData.stats.uniqueCountriesCount}</h3>
                      <p>Countries Reached</p>
                    </div>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-icon">📩</span>
                    <div>
                      <h3>{analyticsData.stats.totalMessages}</h3>
                      <p>Contact Messages</p>
                    </div>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-icon">🔴</span>
                    <div>
                      <h3>{analyticsData.stats.unreadMessages}</h3>
                      <p>Unread Messages</p>
                    </div>
                  </div>
                </div>

                {/* Country Breakdown Table */}
                <div className="admin-panel-card glass" style={{ marginTop: '28px' }}>
                  <div className="card-header">
                    <h2>🌍 Visitors Breakdown by Country</h2>
                    <span className="badge">{analyticsData.countries.length} Countries</span>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th>Visitors</th>
                          <th>Distribution</th>
                          <th>Last Visited</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.countries.length === 0 ? (
                          <tr><td colSpan="4" style={{ textAlign: 'center' }}>No visitor records stored yet.</td></tr>
                        ) : (
                          analyticsData.countries.map((c, i) => {
                            const pct = Math.round((c.count / totalVisits) * 100);
                            return (
                              <tr key={i}>
                                <td>
                                  <span className="flag-emoji">{getCountryFlag(c.countryCode)}</span>{' '}
                                  <strong>{c.country}</strong> <code>({c.countryCode})</code>
                                </td>
                                <td>{c.count}</td>
                                <td style={{ width: '220px' }}>
                                  <div className="progress-bar-wrap">
                                    <div className="progress-bar-fill" style={{ width: `${Math.max(5, pct)}%` }} />
                                    <span>{pct}%</span>
                                  </div>
                                </td>
                                <td>{new Date(c.lastVisited).toLocaleString()}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Visitors Activity Log */}
                <div className="admin-panel-card glass" style={{ marginTop: '28px' }}>
                  <div className="card-header">
                    <h2>🕒 Recent Visitors Log (Last 20)</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Flag & Country</th>
                          <th>City / Region</th>
                          <th>IP Address</th>
                          <th>Page Path</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentVisitors.map((v, i) => (
                          <tr key={i}>
                            <td>
                              <span className="flag-emoji">{getCountryFlag(v.countryCode)}</span> {v.country}
                            </td>
                            <td>{v.city}, {v.region}</td>
                            <td><code>{v.ip}</code></td>
                            <td><code>{v.path}</code></td>
                            <td>{new Date(v.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: CONTACT MESSAGES INBOX */}
            {activeTab === 'inbox' && (
              <motion.div
                key="inbox-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inbox-layout">
                  {/* Messages List */}
                  <div className="messages-list glass">
                    <div className="card-header">
                      <h2>📬 Messages ({messages.length})</h2>
                    </div>
                    {messages.length === 0 ? (
                      <div className="empty-inbox">No messages submitted yet.</div>
                    ) : (
                      messages.map(m => (
                        <div 
                          key={m._id} 
                          className={`message-item ${!m.isRead ? 'unread' : ''} ${selectedMessage?._id === m._id ? 'selected' : ''}`}
                          onClick={() => { setSelectedMessage(m); if (!m.isRead) toggleMessageRead(m._id); }}
                        >
                          <div className="msg-top">
                            <span className="msg-sender">{m.name}</span>
                            <span className="msg-date">{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="msg-subject">{m.subject}</div>
                          <div className="msg-meta">
                            <span className="flag-emoji">{getCountryFlag(m.countryCode)}</span> {m.country}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Detail Viewer */}
                  <div className="message-detail glass">
                    {selectedMessage ? (
                      <div>
                        <div className="detail-header">
                          <div>
                            <h2>{selectedMessage.subject}</h2>
                            <p className="sender-info">
                              From: <strong>{selectedMessage.name}</strong> &lt;{selectedMessage.email}&gt;
                            </p>
                            <p className="sender-location">
                              Location: <span className="flag-emoji">{getCountryFlag(selectedMessage.countryCode)}</span> {selectedMessage.country} | IP: <code>{selectedMessage.ip}</code>
                            </p>
                            <p className="sender-time">Date: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="detail-actions">
                            <button 
                              className={`btn-action ${selectedMessage.isRead ? 'read' : ''}`}
                              onClick={() => toggleMessageRead(selectedMessage._id)}
                            >
                              {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button 
                              className="btn-action delete"
                              onClick={() => deleteMessage(selectedMessage._id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>

                        <div className="detail-body">
                          {selectedMessage.message}
                        </div>
                      </div>
                    ) : (
                      <div className="select-msg-placeholder">
                        👈 Select a contact message from the inbox to read details
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ACCOUNT SETTINGS / CHANGE PASSWORD */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="admin-panel-card glass" style={{ maxWidth: '600px' }}>
                  <div className="card-header">
                    <h2>⚙️ Update Admin Login Credentials</h2>
                  </div>

                  {settingsStatus === 'success' && (
                    <div className="admin-alert success">✅ Credentials updated successfully!</div>
                  )}
                  {settingsStatus && settingsStatus !== 'success' && settingsStatus !== 'updating' && (
                    <div className="admin-alert error">❌ {settingsStatus}</div>
                  )}

                  <form onSubmit={handleCredentialsUpdate} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label>New Username</label>
                      <input 
                        type="text" 
                        value={newUsername} 
                        onChange={e => setNewUsername(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)} 
                        placeholder="Enter current password to verify" 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="Enter new password" 
                        required 
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={settingsStatus === 'updating'}>
                      {settingsStatus === 'updating' ? 'Saving...' : 'Update Admin Credentials →'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
