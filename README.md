# 🚀 DriveX — Personal Cloud File Management System

**DriveX** is a full-stack MERN file management application inspired by Google Drive. It allows users to securely upload, organize, access, search, share, and manage their files through a clean web interface.

Built with React, Node.js, Express.js, and MongoDB, DriveX focuses on **user-level data isolation, secure authentication, organized file management, granular sharing permissions, and file version history**.

🔗 **GitHub Repository:** [https://github.com/sachinydv0002/DriveX](https://github.com/sachinydv0002/DriveX)

---

## ✨ Key Features

### 🔐 1. Secure Authentication & Account Isolation

- User registration and login.
- Password hashing before storage.
- JWT-based authentication using HTTP-only cookies.
- Protected backend routes for authenticated operations.
- Server-side ownership validation for file and folder operations.
- **Personal Drive for every user:** Each user can access only their own files and folders unless an item is explicitly shared with them.
- User-scoped database records help prevent unauthorized cross-account access.
- Authentication and authorization checks are handled by the backend, not just the frontend.

### 🛡️ 2. Privacy & Safety

- Private files are associated with their owner and should not be accessible to other users by default.
- Access to shared files and folders is controlled through Viewer and Editor permissions.
- Authentication tokens are handled using HTTP-only cookies.
- Passwords are hashed before being stored.
- Protected operations perform server-side authentication and authorization checks.
- Revoking a user's sharing access should remove their permission to access the shared resource.
- Sensitive configuration such as database credentials and JWT secrets belongs in environment variables, not source control.

**Privacy boundary:** DriveX provides application-level access controls; this does not by itself guarantee end-to-end encryption, encryption at rest, or an independent security audit.

### 📁 3. Personal Drive & File Management

- Upload and download files.
- Create and manage folders.
- Rename and delete files and folders.
- Move items between folders.
- Restore items from trash where supported.
- Organize content in a structured folder hierarchy.
- Allow multiple files with the same filename.
- Track file metadata, including names, sizes, and dates.

### 🌳 4. Nested Folder System

- Create folders inside other folders.
- Navigate through a hierarchical folder structure.
- Organize files into meaningful categories and subfolders.
- Keep files associated with their intended parent folders.
- Perform folder operations with backend ownership checks.

### 🕘 5. File Version History

- Maintain previous versions of files.
- Upload a new version of an existing file.
- Track version-related metadata.
- Access available versions through version history.
- Download a previous version.
- Restore an earlier version when needed.

**Why it matters:** Version history helps users recover earlier file contents instead of relying on a single overwritten copy.

### 🤝 6. Manage Access & File Sharing

- Share files and folders with other users through the access-management system.
- Assign **Viewer** or **Editor** permissions.
- Allow owners to revoke access.
- Restrict Viewer access to permitted operations.
- Allow Editors to perform authorized editing operations.
- Enforce access permissions on protected backend routes.

**Granular access control:** Sharing an item should not grant unrestricted access to unrelated users' files or folders.

### 🔎 7. Advanced Search

- Search for files by available metadata.
- Find files without manually navigating every folder.
- Narrow down file discovery using the available search functionality.
- Support a more efficient workflow as the number of stored files grows.

### ⭐ 8. Starred Items

- Star important files and folders.
- Unstar items when they are no longer important.
- Quickly identify frequently used content.

### 🗑️ 9. Trash & Recovery

- Manage deleted items through the available trash functionality.
- Restore supported deleted files or folders.
- Keep deletion and recovery operations subject to backend access checks.

### 🖥️ 10. Modern Web Interface

- React-based user interface.
- Vite-powered frontend development.
- Login and signup screens.
- File and folder management interface.
- Folder navigation and search.
- Access management and version history interfaces.

---

## 🛠️ Technology Stack

| Technology                        | Purpose                                 |
| --------------------------------- | --------------------------------------- |
| React.js                          | Frontend user interface                 |
| Vite                              | Frontend development and build tooling  |
| Node.js                           | JavaScript runtime                      |
| Express.js                        | Backend API and routing                 |
| MongoDB                           | Persistent database                     |
| Mongoose                          | Database models and queries             |
| JWT                               | Authentication tokens                   |
| HTTP-only Cookies                 | Authentication cookie handling          |
| bcrypt / password hashing library | Password protection                     |
| Multer                            | File upload handling                    |
| CSS                               | Interface styling                       |
| Git & GitHub                      | Version control and source code hosting |

---

## 🏗️ System Architecture

DriveX follows a client-server architecture.

```text
                 ┌──────────────────────┐
                 │      User Browser    │
                 │    React + Vite      │
                 └──────────┬───────────┘
                            │
                   HTTP API Requests
                   HTTP-only Cookies
                            │
                 ┌──────────▼───────────┐
                 │    Express Backend   │
                 │  Authentication      │
                 │  Authorization       │
                 │  File/Folder APIs    │
                 │  Sharing & Versions  │
                 └───────┬───────┬──────┘
                         │       │
              ┌──────────▼──┐ ┌──▼────────────┐
              │   MongoDB   │ │ File Storage  │
              │ Metadata &  │ │ server/uploads│
              │ User Records│ │               │
              └─────────────┘ └───────────────┘
```

### How data isolation works

DriveX uses user ownership and backend authorization to isolate personal data.

- Files and folders are associated with their owners.
- Protected operations validate the authenticated user.
- Access to shared items is governed by the application's sharing permissions.
- MongoDB stores application records, while uploaded file contents are stored locally in the backend's upload directory.

**Note:** User-level isolation does not mean a separate MongoDB database or operating-system folder is automatically created for every account.

---

## 📂 Project Structure

```text
DriveX/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── file.js
│   │   ├── folder.js
│   │   └── fileVersion.js
│   ├── uploads/
│   ├── server.js
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Install the following before running DriveX:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a MongoDB-compatible hosted database
- [Git](https://git-scm.com/)

### Step 1: Clone the repository

```bash
git clone https://github.com/sachinydv0002/DriveX.git
cd DriveX
```

### Step 2: Install backend dependencies

```bash
cd server
npm install
```

### Step 3: Configure backend environment variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

Use the exact MongoDB variable name expected by your backend code. If the project uses a different name, configure that name instead.

**Important:** Never commit your real `.env` file, database credentials, JWT secrets, or authentication cookies to GitHub.

### Step 4: Start the backend

From the `server` directory:

```bash
node server.js
```

The backend should connect to MongoDB and start on the configured port.

### Step 5: Install frontend dependencies

Open a second terminal:

```bash
cd client
npm install
```

### Step 6: Configure the frontend API URL

Create `client/.env` if the frontend requires it:

```env
VITE_API_URL=http://localhost:5000/api
```

Use the API base URL expected by the existing frontend code. Avoid adding `/api` twice.

### Step 7: Start the frontend

From the `client` directory:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 🔒 Security & Privacy Considerations

DriveX includes several security-oriented implementation choices:

- HTTP-only cookies for authentication token handling.
- Password hashing rather than storing plain-text passwords.
- Protected API routes.
- Server-side ownership checks.
- User-scoped file and folder operations.
- Permission checks for shared resources.
- Environment variables for sensitive configuration.

### Privacy & safety principles

- **Least privilege:** users should receive only the access granted to them.
- **Private by default:** sharing should be explicit; do not assume files are public.
- **Permission revocation:** verify that revoked access no longer works through direct API requests.
- **Safe error handling:** avoid returning secrets, tokens, internal paths, or sensitive file details in error messages.
- **Upload safety:** validate uploaded files and prevent unsafe path handling.
- **Repository hygiene:** exclude `.env` files, authentication cookies, and uploaded user content from Git.

These are implementation and verification goals; do not describe a control as fully enforced until it has been tested against the current backend.

### Deployment security checklist

Before deploying DriveX publicly:

- Configure secure cookies and HTTPS.
- Configure appropriate CORS and cookie settings.
- Use a strong, private JWT secret.
- Keep database credentials out of source control.
- Review authorization checks for files, folders, nested resources, and versions.
- Use durable cloud or persistent storage for uploaded files.
- Test Viewer and Editor permissions with separate accounts.
- Verify that one user cannot access another user's private files by changing API identifiers.

Security features reduce risk, but the application should not be considered security-audited solely because these mechanisms exist.

---

## 🧪 Testing Checklist

Use this checklist to verify the application before a production release.

- [x] Register a new account and log in.
- [x] Confirm that unauthenticated requests cannot access protected APIs.
- [x] Upload and download files.
- [x] Create nested folders and navigate between them.
- [x] Rename, move, delete, and restore supported items.
- [x] Upload files that have duplicate filenames.
- [x] Star and unstar files or folders.
- [x] Search for files using the available search options.
- [x] Share a file or folder with another user.
- [x] Verify Viewer and Editor restrictions.
- [x] Revoke a user's access and verify that access is removed.
- [x] Upload a new file version.
- [x] Download an earlier version and restore it.
- [x] Verify that separate users cannot access each other's private data.
- [x] Verify that application secrets and user uploads are not committed to GitHub.

---

## 🚧 Current Scope & Future Improvements

DriveX is currently designed around local backend file storage and a MongoDB database.

Potential future improvements include:

- Cloud object storage integration, such as Amazon S3.
- Deployment with persistent file storage.
- File previews for supported formats.
- Improved search and filtering.
- Automated backend and frontend tests.
- Activity logs and improved error reporting.
- Additional file-sharing controls.
- Production monitoring and performance improvements.

These are future improvements, not claims that they are already implemented.

---

## 👨‍💻 Author

**Sachin Kumar**

B.Tech — Computer Science and Engineering (IoT)

GitHub: [@sachinydv0002](https://github.com/sachinydv0002)

Project: [DriveX Repository](https://github.com/sachinydv0002/DriveX)

---

**DriveX — Your files. Your folders. Your access controls.**
