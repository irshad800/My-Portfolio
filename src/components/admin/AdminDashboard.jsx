import { useState, useEffect, useRef } from 'react';
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

// Web Audio API dual-tone notification chime (synthesized tone)
function playNotificationTone(type = 'visit') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'message') {
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15); // B5
    } else {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
    }

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio blocked or not supported
  }
}

export default function AdminDashboard({ token, username, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, inbox, settings
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    stats: { totalVisits: 0, totalMessages: 0, unreadMessages: 0, uniqueCountriesCount: 0 },
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    countries: [],
    recentVisitors: []
  });
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Live Notification & Toast State
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );
  const [toastNotification, setToastNotification] = useState(null);
  const prevDataRef = useRef({ visits: null, messages: null });

  // Change Password Form State
  const [newUsername, setNewUsername] = useState(username || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showToast = (title, body) => {
    setToastNotification({ title, body });
    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        showToast('🔔 Live Notifications Activated!', 'You will receive mobile & desktop push alerts for new visits and messages.');
        try {
          new Notification('🔔 Notifications Enabled!', {
            body: 'Live alerts active for new portfolio visitors and contact messages.',
          });
        } catch (e) {}
      }
    }
  };

  const notifyAdmin = (title, body, type = 'visit') => {
    playNotificationTone(type);
    showToast(title, body);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (err) {
        console.log('Push notification error:', err);
      }
    }
  };

  const pollAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newVisits = data.stats.totalVisits || 0;
        const newMessagesCount = data.stats.totalMessages || 0;
        const latestVisitor = data.recentVisitors && data.recentVisitors[0];

        // Trigger notification on NEW VISITS
        if (prevDataRef.current.visits !== null && newVisits > prevDataRef.current.visits) {
          const location = latestVisitor ? `${latestVisitor.country} (${latestVisitor.deviceType || 'Mobile'})` : 'New Location';
          notifyAdmin('👁️ New Visitor Alert!', `New visit detected from ${location}`, 'visit');
        }

        // Trigger notification on NEW MESSAGES
        if (prevDataRef.current.messages !== null && newMessagesCount > prevDataRef.current.messages) {
          notifyAdmin('📩 New Contact Message!', 'Someone just sent a contact message on your portfolio!', 'message');
        }

        prevDataRef.current = {
          visits: newVisits,
          messages: newMessagesCount
        };

        setAnalyticsData({
          stats: data.stats || { totalVisits: 0, totalMessages: 0, unreadMessages: 0, uniqueCountriesCount: 0 },
          devices: data.devices || { desktop: 0, mobile: 0, tablet: 0 },
          countries: data.countries || [],
          recentVisitors: data.recentVisitors || []
        });
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
      await Promise.all([pollAnalytics(), fetchMessages()]);
      setLoading(false);
    };
    loadAll();

    // Auto-poll every 6 seconds for real-time mobile/desktop alerts
    const timer = setInterval(() => {
      pollAnalytics();
      fetchMessages();
    }, 6000);

    return () => clearInterval(timer);
  }, [token]);

  const toggleMessageRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        pollAnalytics();
        fetchMessages();
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
        pollAnalytics();
        fetchMessages();
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
  const desktopCount = analyticsData.devices?.desktop ?? analyticsData.devices?.Desktop ?? 0;
  const mobileCount = analyticsData.devices?.mobile ?? analyticsData.devices?.Mobile ?? 0;
  const tabletCount = analyticsData.devices?.tablet ?? analyticsData.devices?.Tablet ?? 0;

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'Mobile') return '📱 Mobile';
    if (deviceType === 'Tablet') return '📟 Tablet';
    if (deviceType === 'Desktop') return '💻 Desktop';
    return '💻 Desktop';
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Floating Toast Notification Banner */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            className="admin-toast-banner"
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="toast-header">
              <strong>{toastNotification.title}</strong>
              <button onClick={() => setToastNotification(null)}>✕</button>
            </div>
            <div className="toast-body">{toastNotification.body}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Header */}
      <div className="admin-mobile-topbar">
        <div className="admin-sidebar-brand">
          <span className="brand-dot">⚡</span> Irshad Admin
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notificationPermission !== 'granted' && (
            <button className="admin-notif-btn" onClick={requestNotificationPermission}>
              🔔 Enable Alerts
            </button>
          )}
          <button 
            className="admin-mobile-toggle"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? '✖ Close' : '☰ Menu'}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand desktop-only">
          <span className="brand-dot">⚡</span> Irshad Admin
        </div>
        <div className="admin-user-badge">
          Logged in as <strong>{username || 'admin'}</strong>
        </div>

        <nav className="admin-nav-links">
          <button 
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setMobileSidebarOpen(false); }}
          >
            📊 Analytics & Devices
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inbox'); setMobileSidebarOpen(false); }}
          >
            📬 Inbox ({analyticsData.stats.unreadMessages > 0 ? `🔴 ${analyticsData.stats.unreadMessages}` : messages.length})
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
          >
            ⚙️ Credentials
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
            <h1>Executive Dashboard</h1>
            <p>Real-time Mobile & Desktop Visitor & Message Tracking</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className={`admin-notif-btn ${notificationPermission === 'granted' ? 'active' : ''}`}
              onClick={requestNotificationPermission}
            >
              {notificationPermission === 'granted' ? '🟢 Alerts Active' : '🔔 Enable Push Alerts'}
            </button>
            <button className="btn btn-outline admin-refresh-btn" onClick={() => { pollAnalytics(); fetchMessages(); }}>
              🔄 Refresh
            </button>
          </div>
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
                    <span className="metric-icon">💻</span>
                    <div>
                      <h3>{desktopCount}</h3>
                      <p>Desktop / PC Users</p>
                    </div>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-icon">📱</span>
                    <div>
                      <h3>{mobileCount}</h3>
                      <p>Mobile Users</p>
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
                          <th>Device Type</th>
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
                            <td>
                              <span className="device-badge">{getDeviceIcon(v.deviceType)}</span>
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
