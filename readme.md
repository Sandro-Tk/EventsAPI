# 🎉 EventsAPI

A full-featured RESTful API for managing events, user accounts, and RSVPs — built with **Node.js**, **Express**, and **MongoDB**.

## 🌟 Features

- 🔐 **Authentication & Authorization** (JWT + Role-based)
- 👤 **User Management** (Create, update, deactivate, delete users)
- 📅 **Event CRUD** (Admins can create, update, delete events)
- 🖼️ **Image Uploads** (Multer for users & events with size limits)
- ✅ **RSVP / Unattend System**
- 🔎 **Advanced Querying**: filter, sort, limit fields, and paginate
- ⚙️ **Pagination Metadata** (total results, total pages, current page)
- 📛 **Centralized Error Handling** (AppError + Global Middleware)
- 🛡️ **Security**: Helmet, rate limiting, input validation
- ⚡ **Async Wrapper**: No more repetitive `try/catch`
- 🔧 **Configurable Environments** via `.env`
- 🔗 **Postman Collection** (pre-configured & grouped)

---

## 🛠 Setup & Run

```bash
git clone https://github.com/Sandro-Tk/EventsAPI.git
cd EventsAPI
npm install
cp .env.example config.env
```

---

## ⏩ Start the Server

```bash
npm run dev
```

---

## 📮 View Postman Collection Here --> https://documenter.getpostman.com/view/41309258/2sB3B7MtbJ

---

🚧 Future Enhancement Plans

✉️ Email password reset (currently skipped)

🌐 Deploy with MongoDB Atlas + Render/Vercel

🎨 Build frontend (React or Next.js)
