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

  const swRegRef = useRef(null);

  useEffect(() => {
    // Register Service Worker for Mobile & OS Native System Notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        swRegRef.current = reg;
      }).catch((err) => {
        console.log('SW registration error:', err);
      });
    }
  }, []);

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
        notifyAdmin('🔔 System Notifications Activated!', 'Your device will now show OS native system notifications for new visits and messages.');
      } else {
        alert('Notification permission was denied. Please allow notifications in your browser/device settings.');
      }
    }
  };

  const notifyAdmin = (title, body, type = 'visit') => {
    playNotificationTone(type);
    showToast(title, body);

    // Trigger Device OS Native System Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notifOptions = {
          body,
          icon: './favicon.svg',
          badge: './favicon.svg',
          vibrate: [200, 100, 200],
          tag: 'portfolio-system-alert',
          renotify: true
        };

        if (swRegRef.current && swRegRef.current.showNotification) {
          swRegRef.current.showNotification(title, notifOptions);
        } else if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, notifOptions);
          });
        } else {
          new Notification(title, notifOptions);
        }
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

  // Filter & Search State
  const [ipSearch, setIpSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const [timeRange, setTimeRange] = useState('ALL');

  const filteredVisitors = (analyticsData.recentVisitors || []).filter((v) => {
    // 1. Search text filter (IP, City, Region, Path, Country)
    if (ipSearch.trim() !== '') {
      const q = ipSearch.toLowerCase().trim();
      const matchIp = v.ip && v.ip.toLowerCase().includes(q);
      const matchCity = v.city && v.city.toLowerCase().includes(q);
      const matchRegion = v.region && v.region.toLowerCase().includes(q);
      const matchPath = v.path && v.path.toLowerCase().includes(q);
      const matchCountry = v.country && v.country.toLowerCase().includes(q);
      if (!matchIp && !matchCity && !matchRegion && !matchPath && !matchCountry) return false;
    }

    // 2. Country filter
    if (selectedCountry !== 'ALL') {
      if (v.country !== selectedCountry) return false;
    }

    // 3. Device filter
    if (selectedDevice !== 'ALL') {
      const dev = (v.deviceType || 'Desktop').toLowerCase();
      const sel = selectedDevice.toLowerCase();
      if (!dev.includes(sel) && !sel.includes(dev)) return false;
    }

    // 4. Time Range filter
    if (timeRange !== 'ALL') {
      const vTime = new Date(v.timestamp).getTime();
      const now = Date.now();
      if (timeRange === '24H' && now - vTime > 24 * 60 * 60 * 1000) return false;
      if (timeRange === '7D' && now - vTime > 7 * 24 * 60 * 60 * 1000) return false;
      if (timeRange === '30D' && now - vTime > 30 * 24 * 60 * 60 * 1000) return false;
    }

    return true;
  });

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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              className={`admin-notif-btn ${notificationPermission === 'granted' ? 'active' : ''}`}
              onClick={requestNotificationPermission}
            >
              {notificationPermission === 'granted' ? '🟢 System Alerts Active' : '🔔 Enable System Alerts'}
            </button>
            {notificationPermission === 'granted' && (
              <button 
                className="admin-notif-btn" 
                style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.3)', color: 'var(--accent2)' }}
                onClick={() => notifyAdmin('📱 System Test Alert!', 'This is a test notification in your device status bar / system notification tray!')}
              >
                📱 Test System Alert
              </button>
            )}
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

                {/* Recent Visitors Activity Log with Filters */}
                <div className="admin-panel-card glass" style={{ marginTop: '28px' }}>
                  <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    <h2>🕒 Visitor Activity Log ({filteredVisitors.length})</h2>
                    <span className="badge">Showing {filteredVisitors.length} of {analyticsData.recentVisitors.length} Logs</span>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="admin-filter-bar">
                    <div className="filter-item search-box">
                      <input 
                        type="text" 
                        placeholder="🔍 Search IP, City, or Path..." 
                        value={ipSearch}
                        onChange={(e) => setIpSearch(e.target.value)}
                        className="admin-filter-input"
                      />
                    </div>

                    <div className="filter-item">
                      <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="admin-filter-select">
                        <option value="ALL">🌍 All Countries</option>
                        {analyticsData.countries.map((c, i) => (
                          <option key={i} value={c.country}>{c.country}</option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-item">
                      <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="admin-filter-select">
                        <option value="ALL">📱 All Devices</option>
                        <option value="Desktop">💻 Desktop / PC</option>
                        <option value="Mobile">📱 Mobile</option>
                        <option value="Tablet">📟 Tablet</option>
                      </select>
                    </div>

                    <div className="filter-item">
                      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="admin-filter-select">
                        <option value="ALL">🕒 All Time</option>
                        <option value="24H">⚡ Last 24 Hours</option>
                        <option value="7D">📅 Last 7 Days</option>
                        <option value="30D">🗓️ Last 30 Days</option>
                      </select>
                    </div>

                    {(ipSearch || selectedCountry !== 'ALL' || selectedDevice !== 'ALL' || timeRange !== 'ALL') && (
                      <button className="admin-filter-reset-btn" onClick={() => { setIpSearch(''); setSelectedCountry('ALL'); setSelectedDevice('ALL'); setTimeRange('ALL'); }}>
                        ✕ Reset
                      </button>
                    )}
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
                        {filteredVisitors.length === 0 ? (
                          <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No visitor records match the selected filters.</td></tr>
                        ) : (
                          filteredVisitors.map((v, i) => (
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
                          ))
                        )}
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
