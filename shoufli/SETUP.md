# ⚡ Shoufli Movie — Quick Start

## What you need
- Node.js 18+  → https://nodejs.org
- MongoDB       → https://www.mongodb.com/try/download/community

---

## 1 · Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` — only these 2 lines matter to start:
```
MONGO_URI=mongodb://localhost:27017/shoufli
JWT_SECRET=any_random_string_here
```

Optional (add later for full features):
```
TMDB_API_KEY=     # free at themoviedb.org/settings/api  → real movie posters
ANTHROPIC_API_KEY= # console.anthropic.com → AI chatbot responses
EMAIL_HOST=        # leave blank in dev → emails print as URLs in terminal
```

---

## 2 · Install

```bash
# From the shoufli/ root folder:
cd server && npm install
cd ../client && npm install
```

---

## 3 · Start MongoDB

```bash
# macOS:   brew services start mongodb-community
# Linux:   sudo systemctl start mongod
# Windows: net start MongoDB
```

---

## 4 · Run

**Two terminals:**
```bash
# Terminal 1:
cd server && npm run dev
# → http://localhost:5000

# Terminal 2:
cd client && npm start
# → http://localhost:3000
```

**One command** (from root):
```bash
npm install -g concurrently
npm run dev
```

---

## 5 · Open

```
http://localhost:3000
```

---

## Email verification (dev mode)

No SMTP setup needed. After registering, the server prints:

```
📧  Email preview → https://ethereal.email/message/abc123
```

Open that URL in your browser to see the 6-digit code.

---

## Features

| Feature | Works without keys | Needs TMDB key | Needs Anthropic key |
|---------|-------------------|----------------|---------------------|
| Browse movies | ✅ (mock data) | ✅ (real posters) | — |
| Smart recommendations | ✅ | ✅ | — |
| Shoufli AI page | ✅ | ✅ | ✅ (better messages) |
| Chatbot | ✅ | ✅ | ✅ (smarter replies) |
| Email verification | ✅ (preview URL) | — | — |
| Age classification | ✅ | ✅ | — |
| Tunisian / French UI | ✅ | — | — |

---

## Language auto-detection

The site auto-detects your language:
- Arabic browser/device → 🇹🇳 Tunisian Darija
- French browser/device → 🇫🇷 French
- Everything else        → 🇬🇧 English

Users can override via the flag 🇬🇧🇫🇷🇹🇳 switcher in the navbar.
