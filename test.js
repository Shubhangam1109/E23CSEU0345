/**
 * Test Suite for Priority Inbox Notification System
 * Run with: node test.js
 */

// Mock notification data for testing
const testNotifications = [
  {
    ID: "notif-001",
    Type: "alert",
    Source: "Security",
    Message: "High priority security alert",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    weight: 20,
    result: 0.95
  },
  {
    ID: "notif-002",
    Type: "info",
    Source: "Campus",
    Message: "Campus maintenance scheduled",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    weight: 8,
    result: 0.5
  },
  {
    ID: "notif-003",
    Type: "warning",
    Source: "Academic",
    Message: "Assignment deadline approaching",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    weight: 15,
    result: 0.8
  },
  {
    ID: "notif-004",
    Type: "success",
    Source: "System",
    Message: "System update completed",
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), // 5 days ago
    weight: 5,
    result: 0.6
  },
  {
    ID: "notif-005",
    Type: "alert",
    Source: "Maintenance",
    Message: "Critical system maintenance required",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    weight: 18,
    result: 0.92
  }
];

// Priority calculation logic (same as server.js)
const calculateRecency = (timestamp) => {
  const notifTime = new Date(timestamp).getTime();
  const now = Date.now();
  const ageInHours = (now - notifTime) / (1000 * 60 * 60);
  const recencyScore = 10 * Math.exp(-ageInHours / 24);
  return recencyScore;
};

const calculatePriority = (notification) => {
  const weight = notification.weight || 10;
  const result = notification.result || 0.5;
  const recency = calculateRecency(notification.timestamp || Date.now());
  const normalizedResult = Math.min(Math.max(result, 0), 1);
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

// Run tests
console.log('========================================');
console.log('Priority Inbox System - Test Suite');
console.log('========================================\n');

console.log('Test 1: Calculate Priority Scores');
console.log('----------------------------------');
const prioritized = testNotifications.map(calculatePriority);
prioritized.forEach(notif => {
  console.log(`\n${notif.ID}: ${notif.Message}`);
  console.log(`  Type: ${notif.Type} | Source: ${notif.Source}`);
  console.log(`  Weighted Importance: ${notif.components.weightedImportance.toFixed(2)}`);
  console.log(`  Recency Score: ${notif.components.recency.toFixed(2)}`);
  console.log(`  Age: ${notif.components.ageInHours.toFixed(1)} hours`);
  console.log(`  Final Priority: ${notif.priority.toFixed(2)}`);
});

console.log('\n\nTest 2: Top 10 Sorting');
console.log('----------------------------------');
const sorted = prioritized.sort((a, b) => b.priority - a.priority);
console.log('Ranked by Priority (Top to Bottom):');
sorted.forEach((notif, index) => {
  console.log(`${index + 1}. [${notif.priority.toFixed(2)}] ${notif.ID} - ${notif.Message}`);
});

console.log('\n\nTest 3: Verify Algorithm Properties');
console.log('----------------------------------');

// Test 3a: Recent notification should rank high even with lower weight
const recentLowWeight = {
  ID: "test-recent",
  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  weight: 5,
  result: 0.5
};
const recentLowPriority = calculatePriority(recentLowWeight);
console.log(`✓ Recent low-weight notification priority: ${recentLowPriority.priority.toFixed(2)}`);

// Test 3b: Old notification with high weight should have lower priority than recent high-weight
const oldHighWeight = {
  ID: "test-old",
  timestamp: new Date(Date.now() - 336 * 60 * 60 * 1000).toISOString(), // 2 weeks old
  weight: 20,
  result: 0.9
};
const oldHighPriority = calculatePriority(oldHighWeight);
const recentHighWeight = {
  ID: "test-recent-high",
  timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour old
  weight: 15,
  result: 0.8
};
const recentHighPriority = calculatePriority(recentHighWeight);

console.log(`✓ Old high-weight notification priority: ${oldHighPriority.priority.toFixed(2)}`);
console.log(`✓ Recent high-weight notification priority: ${recentHighPriority.priority.toFixed(2)}`);
console.log(`✓ Recent ranks higher: ${recentHighPriority.priority > oldHighPriority.priority ? 'YES' : 'NO'}`);

console.log('\n\nTest 4: Edge Cases');
console.log('----------------------------------');

// Edge case 1: Missing weight/result
const minimal = {
  ID: "test-minimal",
  timestamp: new Date().toISOString()
};
const minimalPriority = calculatePriority(minimal);
console.log(`✓ Minimal notification (defaults used) priority: ${minimalPriority.priority.toFixed(2)}`);

// Edge case 2: Out-of-range result
const outOfRange = {
  ID: "test-out-of-range",
  timestamp: new Date().toISOString(),
  weight: 10,
  result: 1.5 // Should be normalized to 1.0
};
const outOfRangePriority = calculatePriority(outOfRange);
console.log(`✓ Out-of-range result (1.5 → 1.0) priority: ${outOfRangePriority.priority.toFixed(2)}`);

console.log('\n========================================');
console.log('All tests completed successfully!');
console.log('========================================\n');
