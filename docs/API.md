# DriveX API Documentation

REST API reference for **DriveX**, a cloud-based file management application built with Node.js, Express.js, and MongoDB.

[![Node.js](https://img.shields.io/badge/Node.js-Runtime-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)

## Base URL

| Environment | Base URL |
|---|---|
| Local | `http://localhost:5000` |
| Production | `https://drivex-api-27nq.onrender.com` |

All API endpoints use the `/api` prefix.

## Authentication

DriveX uses JWT-based authentication with HTTP-only cookies.

- Register or log in through the authentication endpoints implemented by the server.
- Send the session cookie with authenticated requests.
- Protected operations must enforce ownership and sharing permissions.
- Never expose authentication cookies or JWT secrets.

## File Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/files` | Upload a file |
| `GET` | `/api/files` | Retrieve files |
| `GET` | `/api/files/:id/download` | Download a file |
| `PATCH` | `/api/files/:id/rename` | Rename a file |
| `PATCH` | `/api/files/:id/move` | Move a file |
| `PATCH` | `/api/files/:id/trash` | Move a file to trash |
| `PATCH` | `/api/files/:id/restore` | Restore a file |
| `DELETE` | `/api/files/:id` | Permanently delete a file |

### Upload a File

**Endpoint:** `POST /api/files`  
**Content-Type:** `multipart/form-data`

| Field | Required | Description |
|---|---|---|
| `file` | Yes | File to upload |
| `parentId` | No | Parent folder ID for nested uploads |

Example:

```bash
curl -X POST http://localhost:5000/api/files \
  -b cookies.txt \
  -F "file=@example.pdf"
```

The example assumes the required authentication cookie is available in `cookies.txt`.

## Folder Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/folders` | Create a folder |
| `GET` | `/api/folders` | Retrieve folders |
| `PATCH` | `/api/folders/:id/rename` | Rename a folder |
| `PATCH` | `/api/folders/:id/move` | Move a folder |
| `PATCH` | `/api/folders/:id/trash` | Move a folder to trash |
| `PATCH` | `/api/folders/:id/restore` | Restore a folder |
| `DELETE` | `/api/folders/:id` | Permanently delete a folder |

DriveX supports nested folders through parent-folder references.

## File Versioning

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/files/:id/versions` | Upload a new file version |
| `GET` | `/api/files/:fileId/versions/:versionId/download` | Download a previous version |
| `POST` | `/api/files/:fileId/versions/:versionId/restore` | Restore a previous version |

## Sharing and Access Control

### File Sharing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/files/:id/share` | Share a file |
| `GET` | `/api/files/:id/access` | Retrieve file access permissions |
| `PATCH` | `/api/files/:id/share/:userId` | Update a user's file permissions |
| `DELETE` | `/api/files/:id/share/:userId` | Revoke file access |

### Folder Sharing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/folders/:id/share` | Share a folder |
| `GET` | `/api/folders/:id/access` | Retrieve folder access permissions |
| `PATCH` | `/api/folders/:id/share/:userId` | Update a user's folder permissions |
| `DELETE` | `/api/folders/:id/share/:userId` | Revoke folder access |

Shared resources should only be accessible to users with the appropriate permissions, such as Viewer or Editor.

## Search and Additional Features

DriveX also includes features such as file search, starred items, and trash management. Exact routes and request formats should be verified against the current server implementation before being documented here.

## Security

- Authentication is required for protected operations.
- File and folder access must respect ownership and sharing permissions.
- Uploaded file content is stored separately from MongoDB metadata.
- Upload limits can be configured through `MAX_FILE_SIZE`, if supported by the current server configuration.
- Invalid IDs, missing resources, and unauthorized requests should return appropriate error responses.
- Authentication secrets and session cookies must never be committed to source control.

## Error Handling

The API should return appropriate HTTP status codes for successful requests, invalid input, missing resources, authentication failures, and permission errors.

Exact response bodies and status codes depend on the current implementation and should be documented after verifying the route handlers.

## Notes

This document is a route reference, not a verified OpenAPI specification. Confirm endpoint paths, HTTP methods, request fields, response formats, and status codes against the current backend before relying on it as a complete API contract.
