<div align="center">

# ☁️ DriveX

### Your Files. Your Folders. Your Control.

**A full-stack cloud file management platform built with the MERN stack, featuring secure authentication, file sharing, version history, and cloud storage.**

<p>
  <a href="https://drivex-orcin.vercel.app/"><strong>🚀 LIVE DEMO</strong></a> &nbsp;•&nbsp;
  <a href="https://github.com/sachinydv0002/DriveX"><strong>💻 SOURCE CODE</strong></a> &nbsp;•&nbsp;
  <a href="https://youtu.be/TJr437VDTIU"><strong>▶ WATCH DEMO</strong></a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React and Vite"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js and Express"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/AWS-S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white" alt="AWS S3"/>
</p>

<p>
  <a href="https://drivex-orcin.vercel.app/">
    <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel" alt="Vercel"/>
  </a>
  <a href="https://drivex-api-27nq.onrender.com">
    <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=black" alt="Render"/>
  </a>
  <img src="https://img.shields.io/badge/Storage-Amazon%20S3-FF9900?style=flat-square&logo=amazons3&logoColor=white" alt="Amazon S3"/>
</p>

</div>

---

## 📌 About DriveX

DriveX is a cloud-based file management application inspired by modern cloud drives. It helps users upload, organize, search, share, and manage their files through a clean web interface.

The project combines the **MERN stack, MongoDB, AWS S3, and JWT authentication** to build a scalable file management experience.

Designed with a responsive interface for desktop and mobile screens, DriveX focuses on secure access, organized storage, file recovery, and collaboration.

## ✨ Key Features

### 📂 File & Folder Management
- Upload and download files.
- Create, rename, move, and manage folders.
- Organize files using nested folders.
- Support multiple files with the same name.
- Manage deleted items through Trash and recovery features.

### 🔐 Authentication & Security
- User registration and login.
- JWT-based authentication using HTTP-only cookies.
- Password hashing.
- Protected API endpoints.
- Server-side ownership and authorization checks.
- User-specific file and folder access.

### ☁️ Cloud Storage
- Amazon S3 integration for cloud object storage.
- MongoDB for file metadata and application records.
- Backend-managed file operations.
- Cloud-based architecture for deployed access.

### 🤝 File Sharing & Permissions
- Share files and folders with other users.
- Viewer and Editor permission levels.
- Manage access to shared resources.
- Revoke access when it is no longer required.
- Backend authorization for protected operations.

### 🕘 File Version History
- Maintain previous file versions.
- Upload newer versions of existing files.
- Access available version history.
- Download previous versions.
- Restore an earlier version when supported.

### 🔎 Search & Organization
- Search files using available metadata.
- Star important files and folders.
- Quickly identify frequently used items.
- Navigate nested folders.

### 📱 Responsive Web Experience
- React-based interface.
- Responsive layouts for desktop and mobile screens.
- Browser-based access without requiring a separate native mobile app.
- File and folder management through the web interface.

---

## 🖥️ Live Application

| Component | Link |
|---|---|
| 🌐 Frontend | [Open DriveX](https://drivex-orcin.vercel.app/) |
| ⚙️ Backend API | [DriveX API](https://drivex-api-27nq.onrender.com) |
| 💻 GitHub Repository | [View Source Code](https://github.com/sachinydv0002/DriveX) |
| 🎥 Project Walkthrough | [Watch on YouTube](https://youtu.be/TJr437VDTIU) |

---

## 🏗️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tooling |
| Node.js | Backend runtime |
| Express.js | REST API and server-side logic |
| MongoDB Atlas | Hosted database |
| Mongoose | MongoDB models and queries |
| Amazon S3 | Cloud object storage |
| JWT | Authentication |
| HTTP-only Cookies | Authentication token handling |
| Multer | File upload handling |
| CSS | Responsive interface styling |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Git & GitHub | Version control and source code hosting |

---

## 🔄 How DriveX Works

```text
                  👤 User
                    |
                    ▼
          ┌───────────────────┐
          │   React + Vite    │
          │  Frontend on      │
          │     Vercel        │
          └─────────┬─────────┘
                    |
                    ▼
          ┌───────────────────┐
          │   Express + Node  │
          │ Backend on Render│
          │                   │
          │ Authentication   │
          │ File Operations  │
          │ Sharing & Access │
          └───────┬─────┬─────┘
                  |     |
          ┌───────▼─┐ ┌─▼──────────┐
          │ MongoDB │ │  Amazon S3 │
          │ Atlas   │ │            │
          │         │ │ File Data  │
          │Metadata │ │  Storage   │
          └─────────┘ └────────────┘
```

**Data flow:** The frontend communicates with the backend API. MongoDB stores application records and file metadata, while Amazon S3 stores file objects. The backend manages authentication, permissions, and file operations.

---

## 🔒 Security & Privacy

- HTTP-only cookies for authentication token handling.
- Password hashing.
- Protected backend routes.
- Server-side authorization checks.
- User ownership validation.
- Viewer and Editor access controls.
- Environment variables for sensitive configuration.
- Private cloud storage configuration should prevent unauthorized public access.

Security depends on the deployed configuration and verified authorization behavior. No independent security audit is claimed.

---

## 🗺️ Future Improvements

- ⏳ Configurable automatic file expiration.
- 🖼️ In-browser previews for more file formats.
- 🔔 Activity notifications.
- 📊 Storage usage dashboard.
- 🧪 Automated application tests.
- ⚡ Performance and search improvements.

**Automatic file expiration is planned, not currently implemented.** A future implementation could remove expired S3 objects and their associated MongoDB metadata and version records after a configurable retention period.

---

## 👨‍💻 Developed By

<div align="center">

### Sachin Kumar

**B.Tech — Computer Science & Engineering (IoT)**

<a href="https://github.com/sachinydv0002">
  <img src="https://img.shields.io/badge/GitHub-sachinydv0002-181717?style=for-the-badge&logo=github" alt="GitHub Profile"/>
</a>

<a href="https://sachin-portfolio-navy.vercel.app/">
  <img src="https://img.shields.io/badge/Portfolio-Visit-0A66C2?style=for-the-badge&logo=vercel" alt="Portfolio"/>
</a>

<a href="https://youtu.be/TJr437VDTIU">
  <img src="https://img.shields.io/badge/YouTube-Project%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube Demo"/>
</a>

---

**DriveX — Your files. Your folders. Your access controls.** ☁️

</div>
