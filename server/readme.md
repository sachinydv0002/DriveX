# ⚙️ DriveX Server — Backend API

The backend service for **DriveX**, a full-stack cloud-inspired file management system built using Node.js, Express.js, and MongoDB.

The server handles authentication, authorization, file uploads, folder management, sharing permissions, search, and file version history. It provides the API layer that connects the React frontend with the database and file storage.

🔗 **Main Repository:** [DriveX](https://github.com/sachinydv0002/DriveX)

📂 **Backend Directory:** [server](https://github.com/sachinydv0002/DriveX/tree/main/server)

---

## ✨ Backend Features

### 🔐 1. Authentication & Authorization

- User authentication using JSON Web Tokens (JWT).
- HTTP-only cookie-based authentication.
- Password hashing through the configured password-hashing library.
- Reusable authentication middleware.
- Protected API routes for authenticated operations.
- Server-side validation of resource ownership.
- User-level access isolation for private files and folders.

### 👤 2. User-Level Data Isolation

DriveX associates files and folders with their respective owners.

- Authenticated users can access their own private resources.
- Backend ownership checks help prevent unauthorized access to another user's data.
- Shared resources are governed by the application's access permissions.
- Database operations are scoped to the authenticated user where required.

**Important:** This refers to logical user-level isolation within the application's database and authorization system, not a separate physical database for every user.

### 📁 3. File Management API

- Upload and download files.
- Retrieve file metadata.
- Rename and delete supported files.
- Move files between folders.
- Manage starred items.
- Support duplicate filenames.
- Validate access before protected file operations.

### 🌳 4. Folder Management API

- Create folders.
- Support nested folder structures.
- Retrieve folder contents.
- Rename and move folders.
- Manage folder deletion and recovery where supported.
- Validate ownership during folder operations.

### 🤝 5. Sharing & Access Control

- Manage access to supported shared resources.
- Support Viewer and Editor permission levels.
- Revoke previously granted access.
- Apply backend authorization to protected operations.
- Restrict operations according to the permissions implemented by the application.

### 🕘 6. File Version Management

- Store file-version metadata.
- Upload a new version of an existing file.
- Retrieve available version history.
- Download a previous version.
- Restore an earlier version.
- Associate version records with their relevant file and ownership information.

### 🔎 7. Search & Organization

- Provide backend endpoints for the frontend's file search.
- Retrieve resources according to the implemented query and filtering logic.
- Support starred-file workflows.
- Keep protected data access subject to authentication and authorization.

### 🗑️ 8. Trash & Recovery

- Handle supported deletion operations.
- Provide recovery functionality where implemented.
- Validate access to deleted resources and restore operations.

---

## 🛠️ Technology Stack

| Technology               | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| Node.js                  | JavaScript runtime                       |
| Express.js               | REST API and routing                     |
| MongoDB                  | Persistent application data              |
| Mongoose                 | Database schemas and models              |
| JWT                      | Authentication tokens                    |
| HTTP-only Cookies        | Authentication cookie handling           |
| Password-hashing library | Secure password storage                  |
| Multer                   | Multipart file-upload handling           |
| dotenv                   | Environment configuration, if configured |
| Git & GitHub             | Version control                          |

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

*This is a simplified structure. Additional files may exist in the repository.*

### Important components

| Component               | Responsibility                                                  |
| ----------------------- | --------------------------------------------------------------- |
| `server.js`             | Express application, API routes, middleware, and server startup |
| `middleware/auth.js`    | Authentication middleware                                       |
| `models/User.js`        | User-related database records                                   |
| `models/file.js`        | File metadata and ownership                                     |
| `models/folder.js`      | Folder metadata and hierarchy                                   |
| `models/fileVersion.js` | File-version records                                            |
| `uploads/`              | Local file storage directory                                    |

---

## 🏗️ Backend Architecture

```text
┌──────────────────────────┐
│   React + Vite Client    │
└────────────┬─────────────┘
             │
             │ HTTP API Requests
             │ Authentication Cookies
             ▼
┌──────────────────────────┐
│     Express Server       │
│                          │
│ Authentication           │
│ Authorization            │
│ File & Folder APIs       │
│ Sharing & Permissions    │
│ Version History          │
└───────────┬──────────────┘
            │
       ┌────┴─────────┐
       ▼              ▼
┌──────────────┐ ┌───────────────┐
│   MongoDB    │ │ Local Uploads │
│ Metadata     │ │ File Contents │
└──────────────┘ └───────────────┘
```

MongoDB stores application records and metadata, while uploaded file contents are stored in the backend's local upload directory.

---

## ⚙️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sachinydv0002/DriveX.git
cd DriveX/server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

Use the exact variable names expected by the existing backend code. If your server uses a different MongoDB environment variable, configure that name instead.

**Never commit your real `.env` file, database credentials, JWT secrets, or session cookies.**

### 4. Start the backend

```bash
node server.js
```

If the configuration is correct, the server should connect to MongoDB and start on the configured port.

For development, use the script defined in `package.json` if the project provides one.

---

## 🔌 API Integration

The backend exposes endpoints for the frontend's authentication and file-management workflows.

| API area       | Purpose                                        |
| -------------- | ---------------------------------------------- |
| Authentication | Registration, login, and protected access      |
| Files          | Upload, download, rename, move, and deletion   |
| Folders        | Folder creation, navigation, and management    |
| Sharing        | Access permissions and revocation              |
| Search         | File discovery                                 |
| Versions       | Version listing, upload, download, and restore |
| Starred items  | Marking and retrieving important resources     |

Exact endpoint names and HTTP methods are defined in `server.js`.

---

## 🔒 Security Considerations

- Keep authentication secrets in environment variables.
- Protect private endpoints with authentication middleware.
- Validate resource ownership on the backend.
- Enforce sharing permissions on every relevant operation.
- Validate uploaded files and request parameters.
- Avoid exposing private filesystem paths in API responses.
- Configure appropriate CORS and cookie settings.
- Use HTTPS and secure cookies in production.
- Avoid committing user uploads or sensitive files to source control.

Authentication alone is not sufficient: every protected resource operation must also enforce the appropriate ownership or sharing permission.

---

## 🧪 Backend Testing Checklist

- [x] Server starts and connects to MongoDB.
- [x] Registration and login work.
- [x] Invalid or unauthenticated requests are rejected.
- [x] Users cannot access other users' private files.
- [x] File upload and download work.
- [x] Folder creation and nested navigation work.
- [x] Rename, move, deletion, and recovery work.
- [x] Viewer and Editor permissions are enforced.
- [x] Revoked access no longer permits protected operations.
- [x] File version upload, download, and restore work.
- [x] Invalid identifiers and missing resources are handled safely.
- [x] Secrets and uploaded user files are excluded from GitHub.

Mark each item complete only after verifying it.

---

## 🚧 Future Improvements

Potential backend enhancements include:

- Automated API and authorization tests.
- Cloud object storage integration.
- File upload limits and stronger file validation.
- Rate limiting and improved abuse protection.
- Structured application logging.
- API documentation using OpenAPI/Swagger.
- Improved error handling and monitoring.
- Database indexing and query optimization.

These are potential enhancements, not claims that they are already implemented.

---

## 👨‍💻 Author

**Sachin Kumar**

B.Tech — Computer Science and Engineering (IoT)

GitHub: [sachinydv0002](https://github.com/sachinydv0002)

---

**DriveX Server — Secure APIs for organized file management.**
