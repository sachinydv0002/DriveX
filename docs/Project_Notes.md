# DriveX — Project Notes

## 1. Project Overview

DriveX is a MERN-stack file management application inspired by Google Drive. It provides authenticated file and folder management with sharing and versioning features.

## 2. Implemented Features

- JWT-based cookie authentication.
- Protected file and folder APIs.
- File upload and download.
- Folder creation and nested folder navigation.
- File and folder rename and move operations.
- Trash and restore functionality.
- File version management.
- File and folder sharing with Viewer and Editor permissions.
- Starred items and file search.
- User-specific resource access control.

## 3. Technology Stack

- React.js
- Node.js
- Express.js
- MongoDB and Mongoose
- JWT authentication

## 4. Local Setup

1. Clone the repository.
2. Install dependencies in the client and server directories.
3. Configure the required environment variables.
4. Start the backend server.
5. Start the React frontend.
6. Open the frontend in a browser.

Refer to the root README for the exact commands and environment configuration.

## 5. Security Considerations

- Protected APIs require authentication.
- Ownership and sharing permissions must be checked on the backend.
- Secrets and private configuration must not be committed to GitHub.
- Uploaded files and authentication cookies must not be included in the repository.

## 6. Known Limitations and Pending Verification

- Automated backend integration tests need to be added and run.
- Cross-account access and permission edge cases require automated verification.
- Upload failure handling and storage quota enforcement require verification against the implementation.
- Shared-folder permissions for descendant files and folders are not inherited automatically.
- Deployment and a live demo are not documented here.

## 7. Testing

Manual testing has been performed during development. Automated test coverage should be documented only after the relevant tests have been created and executed successfully.

## 8. Submission

**Repository:** [https://github.com/sachinydv0002/DriveX](https://github.com/sachinydv0002/DriveX)

## 9. Future Improvements

- Automated API and authorization tests.
- Configurable per-user storage quotas.
- Improved upload failure recovery.
- Search and pagination improvements.
- Deployment and a reproducible demo environment.
