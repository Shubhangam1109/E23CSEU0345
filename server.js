const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT, 10) || DEFAULT_PORT;
const loggerMiddleware = require('./logging/loggerMiddleware');
const { Log } = require('./logging/logging');

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

/**
 * Priority Calculation Algorithm
 * Priority Score = (weight × result) + recency_score
 * 
 * Where:
 * - weight: importance multiplier (1-20)
 * - result: outcome value (0-1, normalized)
 * - recency_score: time-decay factor favoring recent notifications
 */

const calculateRecency = (timestamp) => {
  const notifTime = new Date(timestamp).getTime();
  const now = Date.now();
  const ageInHours = (now - notifTime) / (1000 * 60 * 60);
  
  // Exponential decay: newer notifications score higher
  // Max recency score: 10 points for brand new, decays over time
  const recencyScore = 10 * Math.exp(-ageInHours / 24);
  return recencyScore;
};

const calculatePriority = (notification) => {
  // Extract or default values
  const weight = notification.weight || 10;
  const result = notification.result || 0.5;
  const recency = calculateRecency(notification.timestamp || Date.now());
  
  // Normalize result to 0-1 scale if needed
  const normalizedResult = Math.min(Math.max(result, 0), 1);
  
  // Priority formula: weighted importance + recency factor
  const priorityScore = (weight * normalizedResult) + recency;
  
  return {
    ...notification,
    priority: priorityScore,
    components: {
      weightedImportance: weight * normalizedResult,
      recency: recency,
      ageInHours: (Date.now() - new Date(notification.timestamp || Date.now()).getTime()) / (1000 * 60 * 60)
    }
  };
};

/**
 * Fetch notifications from the external API
 * Endpoint: http://4.224.186.213/evaluation-service/notifications
 */
const fetchNotificationsFromExternalAPI = async () => {
  try {
    const response = await axios.get('http://4.224.186.213/evaluation-service/notifications', {
      timeout: 10000
    });
    
    if (response.data && response.data.notifications) {
      return response.data.notifications;
    }
    return [];
  } catch (error) {
    console.error('Error fetching from external API:', error.message);
    Log('backend', 'warn', 'service', `External API fetch failed: ${error.message}`);
    // Return mock data for demonstration
    return generateMockNotifications();
  }
};

/**
 * Generate mock notifications for testing/demonstration
 */
const generateMockNotifications = () => {
  const types = ['alert', 'info', 'warning', 'success'];
  const sources = ['System', 'Campus', 'Academic', 'Security', 'Maintenance'];
  const now = Date.now();
  
  const notifications = [];
  for (let i = 0; i < 50; i++) {
    const hoursAgo = Math.random() * 168; // Up to 1 week old
    const weight = Math.floor(Math.random() * 15) + 5; // 5-20
    const result = Math.random(); // 0-1
    
    notifications.push({
      ID: `notif-${i}`,
      Type: types[Math.floor(Math.random() * types.length)],
      Source: sources[Math.floor(Math.random() * sources.length)],
      Message: `Notification ${i + 1}: Important campus update requiring your attention`,
      timestamp: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
      weight: weight,
      result: result,
      read: Math.random() > 0.7,
      actionUrl: '#'
    });
  }
  
  return notifications;
};

/**
 * GET /api/notifications/priority
 * Returns top 10 prioritized notifications
 */
app.get('/api/notifications/priority', async (req, res) => {
  try {
    // Fetch notifications (will use mock if external API fails)
    const allNotifications = await fetchNotificationsFromExternalAPI();
    
    // Calculate priority for each notification
    const prioritizedNotifications = allNotifications.map(calculatePriority);
    
    // Sort by priority score (descending) and take top 10
    const topNotifications = prioritizedNotifications
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
    
    res.json({
      success: true,
      count: topNotifications.length,
      totalNotifications: allNotifications.length,
      notifications: topNotifications,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/notifications/priority:', error);
    Log('backend', 'error', 'route', `Priority endpoint failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notifications/all
 * Returns all notifications with priority scores
 */
app.get('/api/notifications/all', async (req, res) => {
  try {
    const allNotifications = await fetchNotificationsFromExternalAPI();
    const prioritizedNotifications = allNotifications
      .map(calculatePriority)
      .sort((a, b) => b.priority - a.priority);
    
    res.json({
      success: true,
      count: prioritizedNotifications.length,
      notifications: prioritizedNotifications,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/notifications/all:', error);
    Log('backend', 'error', 'route', `All notifications endpoint failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/calculate-priority
 * Calculate priority for a single notification
 */
app.post('/api/notifications/calculate-priority', (req, res) => {
  try {
    const notification = req.body;
    const result = calculatePriority(notification);
    
    res.json({
      success: true,
      notification: result
    });
  } catch (error) {
    Log('backend', 'error', 'handler', `Calculate-priority request failed: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = (port, attempts = 0) => {
  const maxAttempts = 5;
  const server = app.listen(port, () => {
    console.log(`Priority Inbox API Server running on http://localhost:${port}`);
    Log('backend', 'info', 'service', `Priority Inbox API Server started on port ${port}`);
    console.log(`Endpoints:`);
    console.log(`  - GET /api/notifications/priority (Top 10)`);
    console.log(`  - GET /api/notifications/all (All notifications with priority)`);
    console.log(`  - POST /api/notifications/calculate-priority (Calculate single notification)`);
    console.log(`  - GET /health (Health check)`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempts < maxAttempts) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Trying port ${nextPort}...`);
      startServer(nextPort, attempts + 1);
    } else {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  });
};

startServer(PORT);
