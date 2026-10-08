# Inkflow — Full-Stack Blogging & Publishing Platform

A modern, full-featured blogging platform built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

Designed for community engagement with rich articles, nested discussions, author following, bookmarks, draft system, trending algorithms, and administrative content moderation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS (v4), React Router (v7) |
| **Icons & Feedback** | Lucide React, React Hot Toast |
| **State & Auth** | Context API (AuthContext, ThemeContext), LocalStorage persistence |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs password hashing, Helmet, CORS |
| **Content & Uploads** | WYSIWYG Rich Editor, Multer static uploads, Cloudinary support |
| **Tooling** | Concurrently, Nodemon, Morgan logger, Slugify |

---

## ✨ Features Breakdown

### 1. 🔐 Authentication & Accounts
- User Registration with validation (Name, Username, Email, Password, Confirm Password).
- User Login via Email or Username with salted bcrypt password verification.
- Stateless JWT authentication with automatic request interceptors.
- Role-based authorization (`user` and `admin`).
- Quick-fill **Demo Accounts** on the login screen for instant evaluation.

### 2. 📝 Blog Creation & Publishing
- Full-featured **WYSIWYG Rich Editor** supporting Headings, Bold, Italic, Quotes, Code Blocks, Lists, Links, and Image uploads.
- Cover image support via direct local file upload or image URL with instant preview.
- Dynamic Tagging system (e.g., `#AI`, `#React`, `#Cybersecurity`).
- Category assignment across curated topics (Technology, AI, Programming, Web Development, Data Science, etc.).
- Read-time calculation based on word count.

### 3. 📚 Draft System
- Authors can save unfinished posts as **Drafts** (`status: "draft"`).
- Drafts remain strictly private to the author and can be edited and published whenever ready.

### 4. ❤️ Engagement (Likes, Views & Bookmarks)
- **Live Like System**: Optimistic toggling of likes with real-time counters.
- **View Counter**: Tracks views and prevents repeated count abuse.
- **Bookmarks & Reading List**: Save articles to a personal reading library accessible via the user menu.

### 5. 💬 Nested Commenting System
- Hierarchical discussions: **Post ➔ Comments ➔ Nested Replies**.
- Comment likes, reply threads, and author deletion privileges.

### 6. 👤 User Profiles & Follow Ecosystem
- Custom profiles with banner, avatar, bio, website, and social links (GitHub, Twitter, LinkedIn).
- Authors can **Follow / Unfollow** each other.
- **Following Feed**: Personalized stream displaying articles from followed writers.
- Interactive Followers and Following modals.

### 7. 🔎 Search & Discovery
- Full-text search across article titles, content, categories, and tags.
- Filter by topic categories and interactive tag clouds.
- Sort by **Latest**, **Trending**, **Most Viewed**, or **Most Liked**.

### 8. 🔥 Trending Algorithm
- Calculated rank score based on user engagement:
  $$\text{Trending Score} = (\text{Likes} \times 3) + (\text{Comments} \times 5) + \text{Views}$$
- Spotlight hero banner for top trending stories.

### 9. 🔔 Activity Notifications
- Real-time notification updates for:
  - When someone likes your story.
  - When someone comments on your story.
  - When someone replies to your comment.
  - When a user starts following you.
- Unread badge counter in top navbar and "Mark all as read" capability.

### 10. 🛡️ Safety & Admin Moderation
- In-app reporting modal to report spam, harassment, or inappropriate content.
- Dedicated **Admin Moderation Dashboard**:
  - Platform overview metrics (total users, published posts, drafts, comments, views, pending reports).
  - Resolve or dismiss flagged reports.
  - Delete offensive stories or abusive user accounts.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/blog_platform`) or MongoDB Atlas URI in `server/.env`.

### 1. Install Dependencies
Run from the root directory:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Seed Sample Data
Populate realistic users, high quality articles, nested comments, and relationships:
```bash
npm run seed
```

### 3. Run the Full-Stack Application
Start both the Express backend API and Vite React frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 👥 Demo Credentials

| Role | Name | Username | Email | Password |
|---|---|---|---|---|
| **Admin** | Rahul Sharma | `rahul` | `rahul@blog.dev` | `password123` |
| **Author** | Utkarsh Sharma | `utkarsh` | `utkarsh@blog.dev` | `password123` |
| **Author** | Priya Patel | `priya` | `priya@blog.dev` | `password123` |
| **Author** | Aman Verma | `aman` | `aman@blog.dev` | `password123` |

*(You can also click any of the "Quick Demo Logins" buttons on the Sign In page for one-click authentication).*

---

## 📁 Project Structure

```
Blog_plateform/
├── client/                      # React 19 + Vite Frontend
│   ├── src/
│   │   ├── api/                 # Axios API services
│   │   ├── components/
│   │   │   ├── blog/            # BlogCard, RichEditor, CommentSection, etc.
│   │   │   ├── common/          # Navbar, Footer, Modals, ProtectedRoute
│   │   │   └── user/            # EditProfileModal, UserListModal
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── pages/               # HomePage, BlogDetail, Write, Profile, Explore, etc.
│   │   ├── App.jsx
│   │   └── index.css            # Tailwind CSS v4 styling & typography
│   └── package.json
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/db.js         # Mongoose MongoDB connection
│   │   ├── controllers/         # Auth, Post, Comment, User, Admin controllers
│   │   ├── middleware/          # JWT auth, Multer upload, error handlers
│   │   ├── models/              # User, Post, Comment, Notification, Report
│   │   ├── routes/              # Express API routers
│   │   ├── seed.js              # Database seed script
│   │   └── server.js            # Express server entry point
│   ├── uploads/                 # Local image uploads directory
│   ├── .env                     # Environment variables
│   └── package.json
│
└── package.json                 # Monorepo concurrent execution scripts
```

---

## 🔌 API Reference Summary

- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/auth/me` - Fetch authenticated user
- `PUT /api/auth/profile` - Update profile bio, avatar, socials
- `GET /api/posts` - Fetch filtered/sorted posts (query: search, category, tag, sort, page)
- `GET /api/posts/:identifier` - Fetch post by slug/id (increments views)
- `POST /api/posts` - Create post (published or draft)
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Toggle post like
- `POST /api/posts/:id/bookmark` - Toggle post bookmark
- `GET /api/comments/post/:postId` - Fetch nested comment tree
- `POST /api/comments/post/:postId` - Create comment or reply
- `POST /api/users/:id/follow` - Toggle author follow
- `GET /api/notifications` - Get user notifications
- `GET /api/admin/stats` - Platform metrics (admin only)
- `GET /api/admin/reports` - Content reports (admin only)
- `POST /api/upload` - Upload image file
