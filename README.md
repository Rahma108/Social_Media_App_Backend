# 🚀 Social Media App Backend

A powerful backend API for a social media application built using Node.js.
This project provides authentication, user management, posts, and interactions.

---
# 📘📔 For Testing Document Hoppscotch
https://api-docs.hoppscotch.io/view/76010aa6-1f02-4151-af87-630381ae483f/CURRENT

## 📌 Features

* 🔐 Authentication (Signup / Login)
* 📧 Email verification (OTP)
* 👤 User profile management
* 📝 Create, update, delete posts
* ❤️ Like & comment system
* 🔒 Secure password hashing
* ⚡ RESTful API structure
* 🌐 Environment-based configuration

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Redis (for caching / OTP if used)
* Nodemailer (for emails)

---

## 📂 Project Structure

```
src/
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── post/
│
├── middleware/
├── utils/
├── config/
├── app.js
└── server.js
```

---

## ⚙️ Installation

1. Clone the repository:

```
git clone https://github.com/USERNAME/REPO_NAME.git
```

2. Install dependencies:

```
npm install
```

3. Create `.env` file:

```
PORT=3000
DB_URI=your_mongodb_connection
JWT_SECRET=your_secret
EMAIL=your_email
EMAIL_PASS=your_password
```

4. Run the server:

```
npm run start:dev

npm run start:prod
```

---

## 🔑 Environment Variables

| Variable   | Description        |
| ---------- | ------------------ |
| PORT       | Server Port        |
| DB_URI     | MongoDB connection |
| JWT_SECRET | JWT Secret Key     |
| EMAIL      | Sender Email       |
| EMAIL_PASS | Email Password     |

---

## 📬 API Endpoints (Examples)

### Auth

* POST `/auth/signup`
* POST `/auth/login`
* POST `/auth/verify`

### User

* GET `/user/profile`
* PUT `/user/update`

### Posts

* POST `/post`
* GET `/post`
* DELETE `/post/:id`

---

## 🚀 Deployment

You can deploy this backend using:

* Vercel
* Railway
* Render

---

## ⚠️ Notes

* Make sure `.env` is added to `.gitignore`
* Use strong passwords for security
* Do not expose sensitive data

---

## 👩‍💻 Author

Developed by Rahma 💙

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
