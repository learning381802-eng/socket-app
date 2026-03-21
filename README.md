# ⚡ Socket — Real-Time Chat Application

A full-featured, real-time chat platform built with React, Supabase, and WebSockets. Inspired by the clean UX of Google Chat, Socket delivers DMs, group messaging, and collaborative Spaces with a polished, responsive UI.

---

## ✨ Features

### Core
- 🔐 **Auth** — Email/password + Google OAuth via Supabase Auth, persistent JWT sessions
- 💬 **Real-time messaging** — Instant delivery using Supabase Realtime (WebSocket subscriptions)
- 👥 **Direct Messages** — One-on-one DMs, auto-creates conversation on first message
- 🏠 **Spaces** — Shared group channels with admin/member roles
- 👨‍👩‍👧 **Group chats** — Multi-person conversations
- 📎 **File attachments** — Upload to Supabase Storage, inline image preview
- 😄 **Emoji reactions** — Quick-react to any message with 6 emojis
- 🔔 **Typing indicators** — Live "X is typing..." via Supabase Realtime broadcast
- 🟢 **Presence** — Online/offline status via Supabase Realtime Presence
- 🔍 **Global search** — Full-text search across messages, users, and spaces
- 🌙 **Dark/light mode** — Persisted to localStorage
- 📱 **Responsive** — Works on mobile and desktop

### UI/UX
- Optimistic message sending (instant UI, confirms in background)
- Auto-scroll on new messages
- Message grouping by sender and time
- Collapsible sidebar sections
- Right panel: Members, Shared Files, Pinned Messages
- Keyboard shortcuts (`⌘K` search, `Shift+Enter` newline, `Escape` close)
- `@mention` autocomplete in composer
- Markdown-like formatting: `**bold**`, `*italic*`, `` `code` ``
- Smooth animations via Framer Motion
- Custom scrollbar, skeleton loading states

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables |
| State | Zustand |
| Routing | React Router v6 |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google) |
| Realtime | Supabase Realtime (WebSockets) |
| Storage | Supabase Storage |
| Animations | Framer Motion |
| Emoji | emoji-picker-react |
| Deployment | Netlify (frontend) + Supabase (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/your-username/socket-chat
cd socket-chat
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. Go to **Storage** → Create a new bucket called `attachments` (set to **Public**)
4. Go to **Authentication** → **Providers** → enable **Google** (optional)
5. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📦 Deployment to Netlify

### Option A: Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option B: Netlify Dashboard
1. Push your code to GitHub
2. Connect the repo in [Netlify Dashboard](https://app.netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy!

The `netlify.toml` file already handles SPA routing redirects.

---

## 🗄 Database Schema

```
users
  id (UUID, FK → auth.users)
  email, display_name, avatar_url, status

conversations
  id (UUID)
  type: 'dm' | 'group' | 'space'
  name, description, avatar_url, created_by

memberships
  id (UUID)
  user_id (FK → users), conversation_id (FK → conversations)
  role: 'admin' | 'member'
  last_read_at

messages
  id (UUID)
  conversation_id (FK), sender_id (FK)
  content (TEXT), attachments (JSONB), reactions (JSONB)
  reply_to (FK → messages), edited_at, deleted_at
```

Row Level Security ensures users can only access conversations they belong to.

---

## ⚡ Realtime Architecture

```
Message sent
    ↓
sendMessage() → Supabase INSERT
    ↓
Supabase Realtime broadcasts to all subscribers
    ↓
subscribeToMessages() receives INSERT event
    ↓
Re-fetch message with full user JOIN
    ↓
addMessage() → Zustand store update → React re-render

Typing indicators
    ↓
User types → supabase.channel.broadcast('typing')
    ↓
Other users receive broadcast → setTypingUser()
    ↓
TypingIndicator component shows/hides
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── MainPanel.jsx        # Chat view (header + messages + composer)
│   │   ├── MessageList.jsx      # Virtualized message list with date grouping
│   │   ├── MessageBubble.jsx    # Individual message with reactions/actions
│   │   ├── MessageComposer.jsx  # Rich text input with emoji, file upload
│   │   ├── NewChatModal.jsx     # Create DM/group/space modal
│   │   └── WelcomePanel.jsx     # Home screen
│   ├── layout/
│   │   ├── Sidebar.jsx          # Left navigation panel
│   │   └── RightPanel.jsx       # Context panel (members/files/pinned)
│   └── ui/
│       ├── Avatar.jsx           # Color-coded avatar with image fallback
│       ├── NotificationStack.jsx# Toast notifications
│       ├── SearchOverlay.jsx    # Global search modal
│       └── Modal.jsx            # Modal router
├── lib/
│   └── supabase.js             # Supabase client + all DB helpers
├── pages/
│   ├── AuthPage.jsx            # Sign in / sign up
│   └── ChatLayout.jsx          # Main app shell with routing
├── store/
│   └── index.js                # Zustand global store
├── App.jsx                     # Root with auth guard
├── main.jsx                    # Entry point
└── index.css                   # Global styles + CSS variables
```

---

## 🔒 Security

- **RLS Policies** on all tables — users can only read/write data they're authorized for
- **JWT validation** — Supabase handles token refresh automatically
- **File access** — Upload paths scoped to user ID
- **Input sanitization** — Message content is escaped before rendering (XSS protection)
- **Auth guards** — Protected routes redirect to `/auth` when unauthenticated

---

## 🧪 Optional Advanced Features (Not Yet Implemented)

- [ ] Threaded replies (nested messages)
- [ ] Message editing / deletion
- [ ] Pinned messages
- [ ] Read receipts per message
- [ ] Push notifications (Web Push API)
- [ ] Video calls (WebRTC / Daily.co)
- [ ] Bot integrations (slash commands)
- [ ] Message search with filters (by user, date range)
- [ ] Notification preferences per space

---

## 🤝 Contributing

Pull requests welcome. Please open an issue first for major changes.

---

## 📄 License

MIT
