<p align="center">
  <img src="./assets/banner.png" alt="Social Media Backend Banner" width="100%">
</p>

<h1 align="center">🚀 Social Media Backend</h1>

<p align="center">
A scalable and production-ready Social Media Backend built with <strong>TypeScript</strong>, <strong>Node.js</strong>, <strong>Express.js</strong>, and <strong>MongoDB</strong>.
</p>

<p align="center">
Feature-Based Architecture • REST API • GraphQL • Socket.IO • Redis • Firebase Cloud Messaging
</p>

<p align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</p>

---

# 📖 About

This project is a scalable backend for a social media platform built with modern backend technologies and best practices.

It provides a complete backend solution including authentication, user management, posts, comments, replies, notifications, real-time communication, GraphQL APIs, Redis caching, and file uploads.

The project follows a **Feature-Based Architecture**, making it clean, maintainable, and easy to scale.

---

# 📚 Table of Contents

- Features
- Tech Stack
- Project Structure
- Installation
- Environment Variables
- API Documentation
- Deployment
- Author

---

# ✨ Features

## 🔐 Authentication & Authorization

- User Registration
- Login
- Email Verification (OTP)
- Forgot Password
- Reset Password
- JWT Authentication
- Protected Routes
- Authorization

---

## 👤 User Module

- User Profile
- Update Profile
- Upload Profile Image
- Delete Profile Image
- Search Users

---

## 📝 Post Module

- Create Post
- Update Post
- Delete Post
- Get Posts
- Upload Multiple Images
- Mentions
- Tags
- Privacy Settings
- Pagination
- Filtering

---

## 💬 Comment Module

- Create Comment
- Update Comment
- Delete Comment
- Retrieve Post Comments

---

## 💭 Reply Module

- Create Reply
- Update Reply
- Delete Reply
- Nested Replies

---

## 🔔 Notification Module

- Firebase Cloud Messaging (FCM)
- Mention Notifications
- Read Notifications
- Unread Notifications
- Soft Delete
- Hard Delete

---

## ⚡ GraphQL

- Queries
- Mutations
- Apollo Server
- GraphQL Authentication

---

## ⚡ Real-Time Communication

- Socket.IO
- Live Events
- Instant Notifications

---

## 🚀 Performance

- Redis Caching
- OTP Storage
- Faster Data Retrieval

---

# 🛠 Tech Stack

### Backend

- TypeScript
- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- Bcrypt

### API

- RESTful API
- GraphQL
- Apollo Server

### Real-Time

- Socket.IO

### Cache

- Redis

### Notifications

- Firebase Cloud Messaging (FCM)

### File Upload

- Multer

### Email

- Nodemailer

---

# 📂 Project Structure

```text
src
│
├── common
│   ├── decorators
│   ├── middleware
│   ├── services
│   ├── interfaces
│   ├── utils
│   ├── enums
│   └── validation
│
├── config
│
├── DB
│   ├── connection
│   ├── models
│   └── repositories
│
├── modules
│   ├── auth
│   ├── user
│   ├── post
│   ├── comment
│   ├── reply
│   ├── notification
│   └── graphql
│
├── socket
│
├── app.ts
└── server.ts
```

---

# ⚙ Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Go to the project directory

```bash
cd YOUR_REPOSITORY
```

Install dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file.

```env
PORT=3000

DB_URI=

JWT_SECRET=

EMAIL=

EMAIL_PASS=

REDIS_URL=

FIREBASE_PROJECT_ID=

FIREBASE_CLIENT_EMAIL=

FIREBASE_PRIVATE_KEY=
```

---

# ▶️ Run Project

Development

```bash
npm run start:dev
```

Production

```bash
npm run build

npm run start:prod
```

---

# 📘 API Documentation

### REST API

- Authentication
- Users
- Posts
- Comments
- Replies
- Notifications

### GraphQL

- Queries
- Mutations

### Hoppscotch Collection

> https://api-docs.hoppscotch.io/view/76010aa6-1f02-4151-af87-630381ae483f/CURRENT

---

# 🚀 Deployment

You can deploy the project using:

- AWS
- Railway
- Render
- DigitalOcean

---

# 💡 Project Highlights

✅ RESTful API

✅ GraphQL API

✅ Socket.IO

✅ Redis Caching

✅ Firebase Cloud Messaging

✅ Feature-Based Architecture

✅ Clean Architecture

✅ Modular Design

✅ Scalable Backend

✅ TypeScript

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit a Pull Request.

---

# 👩‍💻 Author

**Rahma Salama**

- 💼 LinkedIn: https://www.linkedin.com/in/rahma-salama/
- 💻 GitHub: https://github.com/Rahma108

---

# ⭐ Support

If you found this project helpful, don't forget to give it a ⭐ on GitHub.

It really motivates me to keep building and sharing more projects.

Happy Coding! 🚀