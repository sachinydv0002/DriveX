<div align="center">

# ⚙️ DriveX Server

### Secure APIs. Smart Storage. Seamless File Management. ☁️

**The backend API powering DriveX — a cloud-inspired file management platform built with Node.js, Express.js, and MongoDB.**

<p>
  <a href="https://drivex-orcin.vercel.app/"><strong>🚀 Live Application</strong></a> &nbsp; • &nbsp;
  <a href="https://github.com/sachinydv0002/DriveX"><strong>💻 Source Code</strong></a> &nbsp; • &nbsp;
  <a href="https://youtu.be/TJr437VDTIU"><strong>▶ Project Demo</strong></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/AWS-S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white" alt="AWS S3"/>
</p>

<p>
  <a href="https://github.com/sachinydv0002/DriveX/tree/main/server">
    <img src="https://img.shields.io/badge/Backend-Source%20Directory-blue?style=flat-square&logo=github" alt="Backend Source"/>
  </a>
  <a href="https://drivex-api-27nq.onrender.com">
    <img src="https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render&logoColor=black" alt="Backend Deployment"/>
  </a>
</p>

</div>

---

## 🌟 Overview

DriveX Server is the backend API for DriveX, a full-stack cloud file management application.

Built with **Node.js, Express.js, and MongoDB**, it manages authentication, file and folder operations, sharing permissions, search, trash, and file version history.

The backend connects the React frontend with application data and file storage while enforcing authentication, ownership validation, and resource-level permissions.

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication using HTTP-only cookies.
- Password hashing.
- Authentication middleware for protected routes.
- Server-side authorization and ownership checks.
- User-level isolation for private files and folders.

### 📁 File Management API
- Upload and download files.
- Retrieve and update file metadata.
- Rename and move files.
- Support duplicate filenames.
- Star and unstar files.
- Handle supported deletion and recovery operations.

### 🌳 Folder Management
- Create and manage folders.
- Support nested folder structures.
- Navigate folder hierarchies.
- Rename and move folders.
- Apply ownership checks to protected operations.

### 🤝 Sharing & Access Control
- Manage access to shared resources.
- Viewer and Editor permission levels.
- Revoke previously granted access.
- Enforce permissions through backend authorization.

### 🕘 File Version Management
- Maintain file-version metadata.
- Upload new versions of existing files.
- Retrieve available version history.
- Download previous versions.
- Restore earlier versions where supported.

### 🔎 Search & Organization
- Provide API support for file search.
- Retrieve resources using available query and filtering logic.
- Support starred-item workflows.
- Restrict protected data access according to permissions.

### 🗑️ Trash & Recovery
- Handle supported file and folder deletion.
- Restore supported deleted resources.
- Apply access checks to recovery operations.

---

## ☁️ Database & Cloud Storage

### 🍃 MongoDB Atlas

MongoDB stores application records, including user information, file metadata, folder information, sharing permissions, and version-related records as implemented by the application.

### 🪣 Amazon S3

Amazon S3 provides cloud object storage for uploaded file contents when configured in the backend.

The backend is responsible for coordinating file operations with storage and maintaining the corresponding database records.

**Storage responsibility:**
- MongoDB — application data and file metadata.
- Amazon S3 — file objects and stored versions when configured.
- Express backend — API operations, authentication, and authorization.

> Storage configuration depends on the deployed backend environment. S3 integration should not be assumed active unless the required credentials, bucket, and environment variables are configured.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and routing |
| MongoDB Atlas | Hosted application database |
| Mongoose | Database schemas and queries |
| Amazon S3 | Cloud object storage |
| JWT | Authentication tokens |
| HTTP-only Cookies | Authentication cookie handling |
| Password-hashing library | Password protection |
| Multer | Multipart file uploads |
| dotenv | Environment configuration, if configured |
| Render | Backend hosting |
| Git & GitHub | Version control |

---

## 🏗️ Backend Architecture

```text
              React + Vite Client
                      |
                      | HTTPS / API Requests
                      | Authentication Cookies
                      ▼
             ┌─────────────────────┐
             │   Express Backend   │
             │                     │
             │ Authentication      │
             │ Authorization       │
             │ File & Folder APIs  │
             │ Sharing & Access    │
             │ Version Management  │
             └──────────┬──────────┘
                        |
                 ┌──────┴──────┐
                 ▼             ▼
          ┌────────────┐  ┌────────────┐
          │ MongoDB    │  │ Amazon S3  │
          │ Atlas      │  │            │
          │            │  │ File       │
          │ Metadata   │  │ Objects    │
          │ Records    │  │ Versions   │
          └────────────┘  └────────────┘
```

---

## 📂 Backend Structure

```text
server/
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── file.js
│   ├── folder.js
│   └── fileVersion.js
├── uploads/
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

*This is a simplified representation. Additional files and configuration may exist in the repository.*

---

## 🔌 API Modules

| Module | Responsibility |
|---|---|
| Authentication | Registration, login, and protected access |
| Files | Upload, download, rename, move, and deletion |
| Folders | Creation, navigation, and folder management |
| Sharing | Viewer/Editor permissions and access revocation |
| Search | File discovery and filtering |
| Versions | Version listing, upload, download, and restoration |
| Starred Items | Marking and retrieving important resources |
| Trash | Supported deletion and recovery operations |

Exact endpoint paths, HTTP methods, request parameters, and response formats are defined in the backend source code.

---

## 🔒 Security & Privacy

- HTTP-only cookies for authentication token handling.
- Password hashing instead of plain-text password storage.
- Protected backend routes.
- Server-side resource ownership validation.
- Authorization checks for shared resources.
- Environment variables for sensitive configuration.
- Appropriate CORS and secure-cookie configuration for production.
- Private storage configuration to prevent unauthorized public access.

**Security principle:** Authentication alone is not sufficient. Every protected resource operation must validate ownership or the relevant sharing permission.

---

## 🚀 Future Improvements

- ⏳ Configurable automatic file expiration.
- 🧪 Automated API and authorization tests.
- 📄 OpenAPI/Swagger documentation.
- ⚡ Database indexing and query optimization.
- 📊 Storage usage and activity reporting.
- 🛡️ Rate limiting and stronger upload validation.
- 📈 Structured logging and production monitoring.

Automatic file expiration is a **planned improvement**, not a currently implemented feature. It could be designed to remove expired storage objects and their associated MongoDB metadata and version records after a configurable retention period.

---

## 👨‍💻 Author

<div align="center">

### Sachin Kumar

**B.Tech — Computer Science & Engineering (IoT)**

<a href="https://github.com/sachinydv0002">
  <img src="https://img.shields.io/badge/GitHub-sachinydv0002-181717?style=for-the-badge&logo=github" alt="GitHub Profile"/>
</a>

<a href="https://sachin-portfolio-navy.vercel.app/">
  <img src="https://img.shields.io/badge/Portfolio-Visit-0A66C2?style=for-the-badge&logo=vercel" alt="Portfolio"/>
</a>

<a href="https://github.com/sachinydv0002/DriveX">
  <img src="https://img.shields.io/badge/Project-DriveX-16A34A?style=for-the-badge&logo=github" alt="DriveX Repository"/>
</a>

---

**DriveX Server — Secure APIs for your digital world.** ⚙️

</div>
