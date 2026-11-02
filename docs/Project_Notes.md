# 🚀 DriveX — Project Notes

DriveX is a MERN-stack file management application inspired by Google Drive. It provides secure file organization, sharing, and version management through a web interface.

**Repository:** [DriveX on GitHub](https://github.com/sachinydv0002/DriveX)

## 📌 Implemented Features

- JWT-based authentication using HTTP-only cookies
- Protected file and folder APIs
- File upload and download
- Nested folders and folder navigation
- File and folder rename and move operations
- Trash, restore, and permanent deletion
- File version management
- File and folder sharing with Viewer and Editor permissions
- Starred items and file search
- User-specific resource access control

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend interface |
| Node.js | JavaScript runtime |
| Express.js | Backend REST APIs |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT | Authentication |

## 🏗️ Project Structure

```text
DriveX/
├── client/          # React frontend
├── server/          # Express backend
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── PROJECT_NOTES.md
└── README.md
```

*The structure is illustrative; verify it against the current repository.*

## 🔐 Security Considerations

- Protected APIs require authentication.
- Ownership and sharing permissions must be enforced by the backend.
- Secrets and private configuration must not be committed to GitHub.
- Uploaded files and authentication cookies must not be included in the repository.
- Unauthorized access attempts should be rejected.

## ⚠️ Known Limitations and Pending Verification

- Automated backend integration tests need to be added and executed.
- Cross-account access and permission edge cases require automated verification.
- Upload-failure handling and storage quota enforcement require verification.
- Shared-folder permissions for descendant resources are not automatically inherited, according to the current project notes.
- Deployment details and a reproducible demo environment need verification.

## 🧪 Testing Status

Manual testing has been performed during development. Automated test coverage should only be documented after the relevant tests have been created and executed successfully.

## 🗺️ Future Improvements

- Automated API and authorization tests
- Configurable per-user storage quotas
- Improved upload-failure recovery
- Search and pagination improvements
- Deployment documentation and a reproducible demo environment
- Configurable file-expiration policies

## 🔗 Project Links

- **GitHub Repository:** [sachinydv0002/DriveX](https://github.com/sachinydv0002/DriveX)
- **API Documentation:** [`docs/API.md`](API.md)
- **Architecture Documentation:** [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
