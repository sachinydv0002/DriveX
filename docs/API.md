# DriveX API Documentation

DriveX provides REST APIs for authenticated file and folder management.

## Base URL

Local development:

```text
http://localhost:5000
```

All endpoints below use the `/api` prefix.

## Authentication

DriveX uses JWT-based cookie authentication.

- Register or log in using the authentication endpoints implemented by the server.
- Authenticated requests must include the session cookie.
- Protected operations should only allow authorized users to access their files and folders.
- Never share authentication cookies or JWT secrets.

## File APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/files` | Upload a file |
| GET | `/api/files` | List files |
| GET | `/api/files/:id/download` | Download a file |
| PATCH | `/api/files/:id/rename` | Rename a file |
| PATCH | `/api/files/:id/move` | Move a file |
| PATCH | `/api/files/:id/trash` | Move a file to trash |
| PATCH | `/api/files/:id/restore` | Restore a file |
| DELETE | `/api/files/:id` | Permanently delete a file |

### Upload a file

`POST /api/files`

Content type: `multipart/form-data`

Fields:
- `file` — required uploaded file.
- `parentId` — optional parent folder ID.

Example using cURL:

```bash
curl -X POST http://localhost:5000/api/files \
  -F "file=@example.pdf"
```

Authenticated requests must include the required session cookie.

## Folder APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/folders` | Create a folder |
| GET | `/api/folders` | List folders |
| PATCH | `/api/folders/:id/rename` | Rename a folder |
| PATCH | `/api/folders/:id/move` | Move a folder |
| PATCH | `/api/folders/:id/trash` | Move a folder to trash |
| PATCH | `/api/folders/:id/restore` | Restore a folder |
| DELETE | `/api/folders/:id` | Permanently delete a folder |

Nested folders use parent-folder references.

## File Version APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/files/:id/versions` | Upload a new version |
| GET | `/api/files/:fileId/versions/:versionId/download` | Download a version |
| POST | `/api/files/:fileId/versions/:versionId/restore` | Restore a previous version |

## Sharing APIs

The server also provides file and folder sharing operations.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/files/:id/share` | Share a file |
| GET | `/api/files/:id/access` | List file access |
| PATCH | `/api/files/:id/share/:userId` | Update a user's file access |
| DELETE | `/api/files/:id/share/:userId` | Revoke file access |
| POST | `/api/folders/:id/share` | Share a folder |
| GET | `/api/folders/:id/access` | List folder access |
| PATCH | `/api/folders/:id/share/:userId` | Update a user's folder access |
| DELETE | `/api/folders/:id/share/:userId` | Revoke folder access |

## Security

- Protected APIs require authentication.
- File and folder operations must enforce ownership and access permissions.
- Uploaded files are stored separately from MongoDB metadata.
- Upload size is configurable using the `MAX_FILE_SIZE` environment variable.
- Invalid IDs, missing resources, and unauthorized operations should return appropriate errors.

## Important Note

This document is a route reference. Verify every endpoint, HTTP method, request field, response format, and status code against the current server implementation before treating it as a complete API contract.
