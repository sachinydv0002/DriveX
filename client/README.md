<div align="center">

# 💻 DriveX Client

### A Modern Interface for Your Cloud Files ☁️

A responsive React frontend for DriveX — a personal cloud file management platform with file organization, secure authentication, sharing, search, and version history.

<p>
  <a href="https://drivex-orcin.vercel.app/"><strong>🚀 Live Demo</strong></a> &nbsp; • &nbsp;
  <a href="https://github.com/sachinydv0002/DriveX"><strong>📦 Main Repository</strong></a> &nbsp; • &nbsp;
  <a href="https://youtu.be/TJr437VDTIU"><strong>▶ Project Demo</strong></a>
</p>

<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
<img src="https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>

</div>

---

## 🌟 Overview

DriveX Client is the frontend of **DriveX**, a full-stack MERN cloud file management application inspired by modern cloud drives.

Built with React.js and Vite, it provides an interactive interface for managing files and folders, controlling sharing permissions, searching content, and accessing file versions.

The frontend communicates with the DriveX backend API, which handles authentication, authorization, database operations, and file storage.

## ✨ Features

### 🔐 Authentication
- User registration and login.
- Backend authentication integration.
- HTTP-only cookie-based session handling.
- Credential-aware API requests for protected operations.

### 📁 File & Folder Management
- Upload and download files.
- Create and navigate nested folders.
- Rename, move, and delete supported items.
- Support duplicate filenames.
- Organize files through the main interface.

### 🤝 Sharing & Access Control
- Manage access to shared files and folders.
- Viewer and Editor permission workflows.
- Allow owners to manage and revoke access.
- Connect interface actions to backend authorization.

### 🕘 File Version History
- View available file versions.
- Upload new versions.
- Download previous versions.
- Restore earlier versions through available controls.

### 🔎 Search & Organization
- Search files using available search functionality.
- Star and unstar important files and folders.
- Navigate folder hierarchies.
- Access file-management actions from the main interface.

### 🗑️ Trash & Recovery
- Access available deletion and recovery features.
- Restore supported files and folders.
- Reflect backend file-management operations in the interface.

### 📱 Responsive Web Interface
- React component-based architecture.
- CSS-based styling.
- Interactive file and folder controls.
- Designed for browser access on desktop and mobile screens.

---

## 🖥️ Live Preview

<div align="center">

### Explore DriveX

<a href="https://drivex-orcin.vercel.app/">
  <img src="https://img.shields.io/badge/OPEN%20DRIVEX-Live%20Application-2563EB?style=for-the-badge&logo=vercel&logoColor=white" alt="Open DriveX"/>
</a>

<a href="https://youtu.be/TJr437VDTIU">
  <img src="https://img.shields.io/badge/WATCH%20DEMO-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch demo"/>
</a>

</div>

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | UI components and application interface |
| Vite | Development server and production build |
| JavaScript (ES6+) | Frontend application logic |
| CSS3 | Styling and responsive layouts |
| Fetch / API requests | Backend communication |
| HTTP-only Cookies | Authentication session handling |
| npm | Package and dependency management |

### 🔗 Backend & Storage Integration

The frontend connects to the DriveX backend, which integrates with:

- **Node.js and Express.js** — API endpoints and server-side operations.
- **MongoDB Atlas** — Application data and file metadata.
- **Amazon S3** — Cloud file storage.

The frontend does not connect directly to MongoDB or Amazon S3. File operations and access permissions are handled through the backend API.

---

## 🏗️ Architecture

```text
          👤 User
             |
             ▼
   ┌────────────────────┐
   │    DriveX Client   │
   │                    │
   │    React + Vite    │
   │    Responsive UI   │
   └─────────┬──────────┘
             |
             │ API Requests
             │ HTTP-only Cookies
             ▼
   ┌────────────────────┐
   │   Express Backend  │
   │                    │
   │ Authentication     │
   │ File Operations    │
   │ Sharing & Versions │
   └────────┬─────┬─────┘
            |     |
      ┌─────▼──┐ ┌▼─────────┐
      │MongoDB │ │ AWS S3   │
      │ Atlas  │ │ Storage  │
      └────────┘ └──────────┘
```

---

## 📂 Project Structure

```text
client/
├── public/
├── src/
│   ├── App.jsx
│   └── App.css
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

*This represents the main frontend structure; additional configuration files may exist in the repository.*

---

## 🔒 Security

- Authentication is handled through the backend.
- HTTP-only cookies help protect authentication tokens from direct JavaScript access.
- Protected operations rely on backend authorization.
- The frontend does not store database credentials or server-side secrets.
- Cross-origin requests must use appropriate credential, CORS, and cookie settings.

**Security boundary:** Hiding a button in the frontend is not sufficient authorization. The backend must validate every protected operation.

---

## 🚀 Future Enhancements

- 🖼️ Expanded file previews.
- ⚡ Improved loading states and error handling.
- 📱 Further mobile usability improvements.
- ♿ Accessibility enhancements.
- 🔎 Enhanced search and filtering.
- 🧪 Automated UI tests.
- 🔔 Activity and notification interface.

These are potential improvements, not claims that they are already implemented.

---

## 👨‍💻 Author

<div align="center">

### Sachin Kumar

**B.Tech — Computer Science & Engineering (IoT)**

<a href="https://github.com/sachinydv0002">
  <img src="https://img.shields.io/badge/GitHub-sachinydv0002-181717?style=for-the-badge&logo=github" alt="GitHub"/>
</a>

<a href="https://sachin-portfolio-navy.vercel.app/">
  <img src="https://img.shields.io/badge/Portfolio-Visit-0A66C2?style=for-the-badge&logo=vercel" alt="Portfolio"/>
</a>

<a href="https://github.com/sachinydv0002/DriveX">
  <img src="https://img.shields.io/badge/Project-DriveX-16A34A?style=for-the-badge&logo=github" alt="DriveX Repository"/>
</a>

---

**DriveX Client — Your files, organized your way.** ☁️

</div>
