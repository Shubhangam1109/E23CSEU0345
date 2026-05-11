# Priority Inbox - Quick Start Guide

## 30-Second Setup

### Option 1: View the Demo (No Setup Required)
```bash
# Just open this file in your browser:
demo.html

# Shows a fully functional UI with sample data
# No server needed
```

### Option 2: Full System (Backend + Frontend)

1. **Install Node.js** (if not installed)
   - Download from https://nodejs.org/ (LTS version)

2. **Navigate to project folder**
   ```bash
   cd priority-inbox-system
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start backend server** (Terminal 1)
   ```bash
   npm start
   ```
   ✓ Server running on http://localhost:5000

5. **Start frontend** (Terminal 2)
   ```bash
   npm run dev
   ```
   ✓ Frontend running on http://localhost:3000

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## What to Expect

### Backend Console Output
```
Priority Inbox API Server running on http://localhost:5000
Endpoints:
  - GET /api/notifications/priority (Top 10)
  - GET /api/notifications/all (All notifications with priority)
  - POST /api/notifications/calculate-priority (Calculate single)
  - GET /health (Health check)
```

### Frontend Display
- **Header**: "Priority Inbox" title with live stats
- **Filters**: All, Unread, Alerts, Warnings
- **Cards**: Top 10 notifications with:
  - Priority score (28.97, 17.66, etc.)
  - Notification type with emoji (🔴 alert, ⚠️ warning)
  - Time since posted
  - Expandable details showing algorithm breakdown

### Test Results
Run the test suite anytime:
```bash
node test.js
```

Output shows:
- Priority calculations for 5 test notifications
- Top 10 ranking
- Algorithm property verification
- Edge case handling

---

## API Endpoints (Using Backend)

### Test in Browser or cURL

**Get Top 10 Notifications**
```bash
curl http://localhost:5000/api/notifications/priority
```

**Get All Notifications**
```bash
curl http://localhost:5000/api/notifications/all
```

**Health Check**
```bash
curl http://localhost:5000/health
```

**Calculate Priority (POST)**
```bash
curl -X POST http://localhost:5000/api/notifications/calculate-priority \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 15,
    "result": 0.8,
    "timestamp": "2024-05-11T10:30:00Z"
  }'
```

---

## Files Overview

| File | Purpose |
|---|---|
| `demo.html` | Standalone UI demo (open in browser) |
| `server.js` | Node.js backend with API |
| `PriorityInbox.jsx` | React frontend component |
| `PriorityInbox.css` | Styling |
| `test.js` | Algorithm validation tests |
| `package.json` | Dependencies |
| `README.md` | Full documentation |
| `Notification_System_Design.md` | Algorithm explanation |

---

## Common Issues

### "Cannot GET /"
- Frontend not running
- Solution: Run `npm run dev` in a new terminal

### "Cannot fetch notifications"
- Backend not running
- Solution: Run `npm start` in a new terminal

### "Port 5000 in use"
- Another app is using the port
- Solution: Kill the process or change port in `server.js`

### Demo looks broken
- Browser cache issue
- Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## Understanding the Algorithm

### Priority Formula
```
Priority = (Weight × Result) + Recency
```

### Example
- **Security Alert** (just received):
  - Weight: 20, Result: 0.95, Age: 5 min
  - Priority: (20 × 0.95) + 9.97 = **28.97** ✅ Rank #1

- **Campus Update** (2 days old):
  - Weight: 5, Result: 0.5, Age: 2 days
  - Priority: (5 × 0.5) + 0.16 = **2.66** ✅ Rank 10+

---

## Next Steps

1. **Try the demo** → Open `demo.html` in browser
2. **Run the tests** → `node test.js`
3. **Start the server** → `npm start`
4. **Customize** → Edit weights in `server.js`
5. **Deploy** → Follow deployment checklist in README.md

---

## Need Help?

1. **Check README.md** - Full documentation with troubleshooting
2. **Review Notification_System_Design.md** - Algorithm details
3. **Run tests** - `node test.js` shows how algorithm works
4. **Check console** - F12 to see browser/server errors

---

## Key Features

✨ Smart priority scoring based on importance + recency
📊 Expandable cards showing algorithm breakdown
🎯 Filter by type (alerts, warnings, etc.)
♻️ Auto-refreshes every 30 seconds
📱 Responsive design (mobile, tablet, desktop)
🎨 Dark theme with smooth animations
⚡ Fast API (calculates 1000 notifications in <10ms)

---

**Status**: ✅ Ready to Use - No additional configuration needed

For questions about the algorithm, see **Notification_System_Design.md**

