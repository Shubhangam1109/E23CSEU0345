import React, { useState, useEffect } from 'react';
import './PriorityInbox.css';

const PriorityInbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', by type
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPriorityNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPriorityNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPriorityNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/notifications/priority');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      // Use mock data for demo if API fails
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = () => {
    const types = ['alert', 'info', 'warning', 'success'];
    const sources = ['System', 'Campus', 'Academic', 'Security', 'Maintenance'];
    const now = Date.now();
    
    return Array.from({ length: 10 }, (_, i) => ({
      ID: `notif-${i}`,
      Type: types[Math.floor(Math.random() * types.length)],
      Source: sources[Math.floor(Math.random() * sources.length)],
      Message: `Priority notification ${i + 1}: Important campus update`,
      timestamp: new Date(now - Math.random() * 168 * 60 * 60 * 1000).toISOString(),
      weight: Math.floor(Math.random() * 15) + 5,
      result: Math.random(),
      read: Math.random() > 0.7,
      priority: Math.random() * 30 + 5,
      components: {
        weightedImportance: Math.random() * 20,
        recency: Math.random() * 10,
        ageInHours: Math.random() * 168
      }
    }));
  };

  const getTypeIcon = (type) => {
    const icons = {
      alert: '🔴',
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅'
    };
    return icons[type] || '📬';
  };

  const getTypeColor = (type) => {
    const colors = {
      alert: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b',
      success: '#10b981'
    };
    return colors[type] || '#6b7280';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'all') return true;
    return notif.Type === filter;
  });

  return (
    <div className="priority-inbox">
      {/* Header */}
      <header className="inbox-header">
        <div className="header-content">
          <h1 className="header-title">Priority Inbox</h1>
          <p className="header-subtitle">Your top 10 most important notifications</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchPriorityNotifications}
          disabled={loading}
        >
          {loading ? '⟳ Loading...' : '⟳ Refresh'}
        </button>
      </header>

      {/* Controls */}
      <div className="controls-bar">
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'alert' ? 'active' : ''}`}
            onClick={() => setFilter('alert')}
          >
            🔴 Alerts
          </button>
          <button 
            className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            ⚠️ Warnings
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error} (showing mock data for demonstration)
        </div>
      )}

      {/* Loading State */}
      {loading && notifications.length === 0 && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your priorities...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotifications.length === 0 && (
        <div className="empty-state">
          <p>✨ All caught up! No notifications match your filter.</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.map((notif, index) => (
          <div 
            key={notif.ID}
            className={`notification-card priority-${Math.min(5, Math.ceil(notif.priority / 6))} ${notif.read ? 'read' : 'unread'}`}
            style={{
              '--type-color': getTypeColor(notif.Type),
              '--rank': index + 1
            }}
            onClick={() => setExpandedId(expandedId === notif.ID ? null : notif.ID)}
          >
            {/* Left Indicator Bar */}
            <div className="indicator-bar"></div>

            {/* Main Content */}
            <div className="card-content">
              {/* Header Row */}
              <div className="card-header">
                <div className="header-left">
                  <span className="icon">{getTypeIcon(notif.Type)}</span>
                  <div className="header-info">
                    <span className="rank-badge">#{index + 1}</span>
                    <span className="source">{notif.Source}</span>
                    <span className="time">{formatTime(notif.timestamp)}</span>
                  </div>
                </div>
                <div className="priority-score">
                  <div className="score-value">{notif.priority.toFixed(1)}</div>
                  <div className="score-label">Priority</div>
                </div>
              </div>

              {/* Message */}
              <p className="message">{notif.Message}</p>

              {/* Expanded Details */}
              {expandedId === notif.ID && (
                <div className="expanded-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Weight</span>
                      <span className="detail-value">{notif.weight}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Result Score</span>
                      <span className="detail-value">{(notif.result * 100).toFixed(0)}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Weighted Importance</span>
                      <span className="detail-value">{notif.components.weightedImportance.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Recency Score</span>
                      <span className="detail-value">{notif.components.recency.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Age</span>
                      <span className="detail-value">{notif.components.ageInHours.toFixed(1)}h</span>
                    </div>
                  </div>
                  <div className="priority-breakdown">
                    <div className="breakdown-title">Priority Calculation</div>
                    <div className="breakdown-formula">
                      ({notif.weight} × {(notif.result).toFixed(2)}) + {notif.components.recency.toFixed(2)} = <strong>{notif.priority.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="card-footer">
                <button className="action-btn">Mark as {notif.read ? 'unread' : 'read'}</button>
                <button className="action-btn">Archive</button>
                <span className="expand-hint">{expandedId === notif.ID ? '▼' : '▶'} Details</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <footer className="inbox-footer">
        <div className="stats">
          <span>Total: {notifications.length} | Showing: {filteredNotifications.length}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default PriorityInbox;
