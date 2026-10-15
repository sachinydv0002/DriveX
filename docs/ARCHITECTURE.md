# DriveX Architecture

## 1. Project Overview

DriveX is a MERN-stack cloud file management application inspired by Google Drive. It allows authenticated users to organize files and folders, manage file versions, and share resources with other users.

## 2. Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js and Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based cookie authentication
- **File Storage:** Server-side upload storage

## 3. High-Level Architecture

```text
User
  |
  v
React Frontend
  |
  v
Express REST API
  |
  +---- Authentication Middleware
  |
  +---- File and Folder Routes
  |
  +---- Version and Sharing Routes
  |
  +---- MongoDB (Metadata)
  |
  +---- File Storage (Uploaded Contents)
```

## 4. Main Components

### Frontend

The React application provides the user interface for browsing folders, uploading files, renaming and moving items, managing trash, viewing versions, and sharing resources.

### Backend

The Express server handles API requests, validates input, authenticates users, checks access permissions, and coordinates database and file-storage operations.

### Database

MongoDB stores application records such as users, file metadata, folder metadata, and file-version information.

### File Storage

Uploaded file contents are stored separately from MongoDB metadata. The configured storage implementation should be verified in the server code.

## 5. Data Models

### User

Represents an account used for authentication and resource ownership.

### File

Stores file information such as filename, size, MIME type, owner, folder reference, timestamps, and applicable sharing or trash metadata.

### Folder

Represents a folder and its relationship to its parent folder, enabling nested folder navigation.

### File Version

Stores information about previous versions of a file so that supported versions can be listed, downloaded, or restored.

## 6. Authentication and Authorization

DriveX uses JWT-based cookie authentication.

Protected API requests must identify the authenticated user. File and folder operations must verify ownership or the permissions granted through sharing.

Viewer and Editor access should be enforced by the backend, not only by hiding frontend controls.

## 7. File Management Flow

1. The user selects a file in the frontend.
2. The frontend sends an authenticated request to the backend.
3. The backend validates the request and checks permissions.
4. The file content is stored in the configured storage layer.
5. MongoDB records the corresponding metadata.
6. The backend returns the operation result to the frontend.

## 8. Security and Data Integrity

- Authenticate protected requests.
- Verify ownership and sharing permissions.
- Validate file and folder identifiers and user input.
- Prevent unsafe file paths and unauthorized file access.
- Keep secrets in environment variables.
- Handle upload failures without leaving inconsistent metadata or incomplete files.

## 9. Limitations and Verification

This document describes the intended architecture. Confirm the exact model fields, indexes, storage implementation, upload-failure handling, and permission rules against the current source code before claiming that every behavior is implemented.
