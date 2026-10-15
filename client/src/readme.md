# ⚛️ DriveX — Frontend Source Code

This directory contains the React source code for **DriveX**, a full-stack cloud-inspired file management application.

The source code powers the user interface for authentication, file and folder navigation, file operations, sharing permissions, search, and version history.

🔗 **Main Project:** [DriveX Repository](https://github.com/sachinydv0002/DriveX)

📂 **Client Application:** [client](https://github.com/sachinydv0002/DriveX/tree/main/client)

---

## ✨ Source Code Overview

### `App.jsx` — Application Logic

The main React application component responsible for the primary application interface and its interactive workflows.

Depending on the implemented functionality, it handles:

- Authentication-related screens and application states.
- File and folder listing and navigation.
- File upload and download interactions.
- Folder creation and management.
- Rename, move, and deletion workflows.
- Starred items and search interactions.
- Access-management controls for shared resources.
- File version history interactions.
- Communication with backend API endpoints.
- User feedback and interface state updates.

### `App.css` — Application Styling

Contains styles for the DriveX interface, including:

- Layout and component styling.
- Navigation and file-list presentation.
- Buttons, dialogs, menus, and interactive elements.
- Spacing, alignment, and visual hierarchy.
- Responsive styling where implemented.

*The exact responsibilities of each file may evolve as the application grows.*

---

## 🧩 Application Architecture

DriveX uses a React frontend that communicates with an Express backend.

```text
┌────────────────────────────┐
│       React Application    │
│                            │
│       App.jsx              │
│       App.css              │
└─────────────┬──────────────┘
              │
              │ HTTP API Requests
              │ Authentication Cookies
              ▼
┌────────────────────────────┐
│      Express Backend       │
│                            │
│ Authentication             │
│ File & Folder Management   │
│ Sharing & Permissions      │
│ File Version History       │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ MongoDB + File Storage     │
└────────────────────────────┘
```

The frontend provides the user interface, while the backend validates authentication, ownership, permissions, and protected operations.

---

## 🔐 Security Responsibilities

The frontend participates in the authentication flow, but it is not the security boundary.

- Authentication is handled through the configured backend session mechanism.
- Protected API requests must include credentials when required by the backend.
- User permissions should be enforced by the server.
- Sensitive server-side secrets must never be placed in React source code.
- Backend responses should be handled without exposing private information.

---

## ⚙️ Running the Frontend

Run these commands from the `client` directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Ensure the backend is running and the frontend API configuration matches the backend URL.

### Build for production

```bash
npm run build
```

This generates the frontend production build in the `dist/` directory by default.

---

## 🧪 Source Code Verification

Before making changes, verify the following:

- [x] The application starts without errors.
- [x] Browser console has no unexpected runtime errors.
- [x] API requests reach the correct backend.
- [x] Authentication and protected actions work.
- [x] File and folder operations work correctly.
- [x] Sharing permissions are reflected in the interface.
- [x] Version history operations work correctly.
- [x] The production build completes successfully.

Mark each item complete only after testing it.

---

## 🚀 Development Guidelines

When extending the frontend:

1. Keep the interface consistent with the existing DriveX design.
2. Reuse existing state and API patterns where appropriate.
3. Handle loading, empty, and error states clearly.
4. Avoid duplicating backend business rules in the frontend.
5. Test important file-management workflows after changes.
6. Never commit credentials, session cookies, or private environment files.

---

## 👨‍💻 Author

**Sachin Kumar**

B.Tech — Computer Science and Engineering (IoT)

GitHub: [sachinydv0002](https://github.com/sachinydv0002)

---

**DriveX — Organized files, controlled access, and a better file-management experience.**
