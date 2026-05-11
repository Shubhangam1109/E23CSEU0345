# Priority Inbox Stage 2

A React/Next.js frontend built to display all notifications and the top priority notifications from the evaluation API.

## Run locally

```bash
cd stage2-app
npm install
npm run dev
```

Open the application at `http://localhost:3000`.

## Features

- `All Notifications` page with pagination and page size control
- `Priority Notifications` page with top `n` sorting and notification type filtering
- Local priority scoring for consistent ranking behavior
- Material UI styling and responsive layout
- Next.js API proxy that forwards external API requests and avoids CORS issues
