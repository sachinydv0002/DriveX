# 💻 DriveX Client — React Frontend

The frontend application for **DriveX**, a full-stack MERN-based personal cloud file management system inspired by Google Drive.

Built with **React.js and Vite**, the client provides an interface for authentication, file and folder organization, file sharing, search, and version management through the DriveX backend API.

🔗 **Main Repository:** [DriveX](https://github.com/sachinydv0002/DriveX)

📂 **Frontend Directory:** [client](https://github.com/sachinydv0002/DriveX/tree/main/client)

---

## ✨ Frontend Features

### 🔐 Authentication Interface

- User registration and login screens.
- Integration with backend authentication.
- HTTP-only cookie-based session handling through API requests.
- Access to protected features through the application's authentication flow.

### 📁 File Management Interface

- Upload and download files.
- View and organize files and folders.
- Create nested folders.
- Rename, move, and delete supported items.
- Handle files with duplicate filenames.

### 🤝 Sharing & Access Management

- Manage access to shared files and folders.
- Support Viewer and Editor permission workflows.
- Allow owners to manage or revoke access through the interface.
- Display operations according to the application's available permissions.

### 🕘 File Version History

- View available file versions.
- Upload a new version of an existing file.
- Download previous versions.
- Restore an earlier version through the available controls.

### 🔎 Search & Organization

- Search for files using the available search functionality.
- Star and unstar important files and folders.
- Navigate through nested folder structures.
- Access file-management controls from the main interface.

### 🎨 User Interface

- React component-based architecture.
- CSS-based styling.
- Interactive file and folder controls.
- Vite-powered local development and production builds.

---

## 🛠️ Technology Stack

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| React.js           | Component-based user interface    |
| Vite               | Development server and build tool |
| JavaScript (ES6+)  | Frontend application logic        |
| CSS3               | Interface styling                 |
| Fetch/API requests | Communication with the backend    |
| HTTP-only Cookies  | Authentication session handling   |
| npm                | Dependency management             |

---

## 📂 Frontend Structure

```text
client/
├── src/
│   ├── App.jsx          # Main application interface and logic
│   └── App.css          # Application styles
├── public/              # Static assets, if present
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── package-lock.json    # Locked dependency versions
├── vite.config.js       # Vite configuration, if present
└── README.md            # Frontend documentation
```

*This is a simplified structure. Additional configuration files may exist in the repository.*

---

## ⚙️ Getting Started

### Prerequisites

Install:

- [Node.js](https://nodejs.org/)
- npm
- A running DriveX backend
- A configured MongoDB connection for the backend

### 1. Clone the repository

```bash
git clone https://github.com/sachiny dv0002/DriveX.git
cd DriveX
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Configure the API URL

If the frontend uses `VITE_API_URL`, create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Use the variable name and URL format expected by the existing frontend code. Avoid duplicating `/api` in the final request URL.

**Important:** Vite exposes variables prefixed with `VITE_` to frontend code. Never put database credentials, JWT secrets, or other private server-side secrets in frontend environment variables.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

```text
http://localhost:5173
```

Keep the backend running separately so API requests can be processed.

---

## 📜 Available Scripts

The following scripts are commonly configured in a Vite project. Check `client/package.json` for the exact scripts available in this repository.

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Build the production frontend        |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run lint checks, if configured       |

### Production build

```bash
npm run build
```

Vite generates the production build in the `dist/` directory by default.

---

## 🔌 Backend Integration

The client communicates with the DriveX Express backend for application data and protected operations.

```text
React Frontend
      │
      │ API requests + credentials
      ▼
Express Backend
      │
      ├── Authentication & Authorization
      ├── File and Folder Operations
      ├── Sharing Permissions
      └── Version History
             │
             ▼
       MongoDB + File Storage
```

The backend is responsible for authentication, ownership validation, permissions, database operations, and file handling. The frontend should not be treated as the security boundary.

---

## 🔒 Security Notes

- Authentication relies on the backend's configured HTTP-only cookie mechanism.
- Requests requiring authentication must use the appropriate credential settings.
- Protected operations must be authorized by the backend.
- Never commit `.env` files containing secrets.
- Never expose JWT secrets or database connection strings in frontend code.
- Configure CORS and cookie settings correctly when frontend and backend run on different origins.

---

## 🧪 Frontend Verification Checklist

- [x] Frontend starts successfully with `npm run dev`.
- [x] Login and registration work with the backend.
- [x] File upload and download work.
- [x] Folder creation and navigation work.
- [x] Search and Star/Unstar work.
- [x] Viewer and Editor workflows work as intended.
- [x] Version history, upload, download, and restore work.
- [x] Production build completes successfully.
- [x] No private credentials are exposed in frontend files.

Only mark an item complete after verifying it.

---

## 🚀 Future Improvements

Possible frontend enhancements include:

- File previews for supported formats.
- Improved loading states and error messages.
- More responsive layouts for mobile devices.
- Accessibility improvements.
- Dedicated automated UI tests.
- Enhanced search and filtering controls.

These are potential improvements, not claims that they are already implemented.

---

## 👨‍💻 Author

**Sachin Kumar**

B.Tech — Computer Science and Engineering (IoT)

GitHub: [sachinydv0002](https://github.com/sachinydv0002)

**DriveX Client — A clean interface for managing your digital files.**
