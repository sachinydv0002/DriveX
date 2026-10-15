import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Search,
  Plus,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Cloud,
  Grid2X2,
  List,
  Folder,
  FileText,
  Image,
  MoreVertical,
  Download,
  Upload,
  Pencil,
  Move,
  RotateCcw,
  Trash,
  X,
} from "lucide-react";
import "./App.css";

const VALID_NAME = /^[^<>:"/\\|?*]+$/;
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const navigation = [
  { label: "My Drive", icon: HardDrive },
  { label: "Shared with me", icon: Users },
  { label: "Recent", icon: Clock },
  { label: "Starred", icon: Star },
  { label: "Trash", icon: Trash2 },
];

function getInitials(name, email) {
  const source = name?.trim() || email || "User";
  const parts = source.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "U";
}

function isMongoId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function getResourceCollection(item) {
  return item?.kind === "folder" ? "folders" : "files";
}

function dedupeResources(resources) {
  const byResourceId = new Map();
  for (const resource of resources) {
    if (!resource || !isMongoId(resource.id)) continue;
    byResourceId.set(`${resource.kind}:${resource.id}`, resource);
  }
  return [...byResourceId.values()];
}

function getApiErrorMessage(response, payload, fallback) {
  if (payload?.message) {
    return payload.message;
  }

  if (response.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (response.status === 403) {
    return "You are not authorized to manage access for this item.";
  }

  if (response.status === 404) {
    return "The requested item or access endpoint was not found. Refresh DriveX and try again.";
  }

  if (response.status >= 500) {
    return "The server could not load the access list. Please try again.";
  }

  return fallback;
}

function AuthScreen({ mode, setMode, form, setForm, onSubmit, isSubmitting, error }) {
  const isSignup = mode === "signup";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon auth-brand-icon"><Cloud size={26} /></span>
          <h1>DriveX</h1>
        </div>
        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={!isSignup ? "selected" : ""}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={isSignup ? "selected" : ""}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {isSignup && (
            <label>
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Your name"
                autoComplete="name"
                disabled={isSubmitting}
              />
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={isSignup ? "At least 6 characters" : "Your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={isSubmitting}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? (isSignup ? "Creating account..." : "Logging in...") : isSignup ? "Create account" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DriveApp({ user, onLogout }) {
  const [state, setState] = useState({ folders: [], files: [] });
  const [activePage, setActivePage] = useState("My Drive");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [moveTarget, setMoveTarget] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [accessTarget, setAccessTarget] = useState(null);
  const [accessEntries, setAccessEntries] = useState([]);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessRole, setAccessRole] = useState("viewer");
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);

  const { folders, files } = state;
  const folderById = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);
  const liveFolders = folders.filter((folder) => !folder.trashed);
  const liveFiles = files.filter((file) => !file.trashed);

  useEffect(() => {
    let active = true;

    async function loadDriveData() {
      try {
        setState({ folders: [], files: [] });
        setCurrentFolder(null);
        const response = await fetch(`${API_BASE}/api/folders?includeTrashed=true`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.success || !Array.isArray(payload.folders)) {
          throw new Error(payload.message || "Unable to refresh folders");
        }

        const folders = payload.folders.map((folder) => ({
        id: String(folder._id || ""),
        name: folder.name,
        parentId: folder.parentId ? String(folder.parentId) : null,
        kind: "folder",
        createdAt: folder.createdAt,
        updated: folder.updatedAt ? new Date(folder.updatedAt).toLocaleDateString() : "Just now",
        starred: Boolean(folder.starred),
        trashed: Boolean(folder.trashed),
        ownerId: String(folder.ownerId || ""),
        sharedWith: folder.sharedWith || [],
        accessRole: folder.accessRole || null,
        sharedRoot: Boolean(folder.sharedRoot),
        canTrash: Boolean(folder.canTrash),
        })).filter((folder) => isMongoId(folder.id));
        const sharedFoldersResponse = await fetch(`${API_BASE}/api/folders?view=shared&all=true`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const sharedFoldersPayload = await sharedFoldersResponse.json().catch(() => ({}));
        if (!sharedFoldersResponse.ok || !sharedFoldersPayload.success || !Array.isArray(sharedFoldersPayload.folders)) {
          throw new Error(sharedFoldersPayload.message || "Unable to refresh shared folders");
        }
        const filesResponse = await fetch(`${API_BASE}/api/files?includeTrashed=true`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        });
        const filesPayload = await filesResponse.json().catch(() => ({}));
        if (!filesResponse.ok || !filesPayload.success || !Array.isArray(filesPayload.files)) {
          throw new Error(filesPayload.message || "Unable to refresh files");
        }
        const sharedFilesResponse = await fetch(`${API_BASE}/api/files?view=shared&all=true`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const sharedFilesPayload = await sharedFilesResponse.json().catch(() => ({}));
        if (!sharedFilesResponse.ok || !sharedFilesPayload.success || !Array.isArray(sharedFilesPayload.files)) {
          throw new Error(sharedFilesPayload.message || "Unable to refresh shared files");
        }

        if (!active) return;
        const sharedFolders = sharedFoldersPayload.folders.map((folder) => ({
          id: String(folder._id || ""),
          name: folder.name,
          parentId: folder.parentId ? String(folder.parentId) : null,
          kind: "folder",
          createdAt: folder.createdAt,
          updated: folder.updatedAt ? new Date(folder.updatedAt).toLocaleDateString() : "Just now",
          starred: Boolean(folder.starred),
          trashed: Boolean(folder.trashed),
          ownerId: String(folder.ownerId || ""),
          sharedWith: folder.sharedWith || [],
          accessRole: folder.accessRole || null,
          sharedRoot: Boolean(folder.sharedRoot),
          canTrash: Boolean(folder.canTrash),
        })).filter((folder) => isMongoId(folder.id));
        setState({
          folders: dedupeResources([...folders, ...sharedFolders]),
          files: dedupeResources([
            ...filesPayload.files.map(formatFile).filter(Boolean),
            ...sharedFilesPayload.files.map(formatFile).filter(Boolean),
          ]),
        });
        setCurrentFolder(null);
      } catch (folderError) {
        if (active) setFailure(folderError.message || "Unable to refresh folders.");
      } finally {
        if (active) setFoldersLoading(false);
      }
    }

    loadDriveData();
    return () => {
      active = false;
    };
  }, [user.id]);

  useEffect(() => {
    function closeMenu(event) {
      if (!event.target.closest(".action-menu")) setOpenMenu(null);
    }
    function closeMenuOnEscape(event) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  function setFailure(message) {
    setError(message);
    setNotice("");
    window.setTimeout(() => setError(""), 3500);
  }

  function showNotice(message) {
    setError("");
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function formatFile(file) {
    const id = file._id || file.id;
    if (!isMongoId(String(id || ""))) return null;
    const size = Number(file.size || 0);
    const updated = file.updatedAt || file.createdAt;
    return {
      id: String(id),
      name: file.name || file.originalName,
      type: file.mimeType?.startsWith("image/") ? "image" : "doc",
      kind: "file",
      mimeType: file.mimeType,
      parentId: file.parentId ? String(file.parentId) : null,
      createdAt: file.createdAt,
      updated: updated ? new Date(updated).toLocaleDateString() : "Just now",
      size: size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`,
      starred: Boolean(file.starred),
      trashed: Boolean(file.trashed),
      ownerId: String(file.ownerId || ""),
      sharedWith: file.sharedWith || [],
      accessRole: file.accessRole || null,
      sharedRoot: Boolean(file.sharedRoot),
      canTrash: Boolean(file.canTrash),
    };
  }

  function getApiParentId() {
    const folder = currentFolder && folderById.get(currentFolder);
    return folder && isMongoId(folder.id) ? folder.id : null;
  }

  async function refreshFiles(parentId) {
    const params = new URLSearchParams();
    if (parentId) params.set("parentId", parentId);
    if (activePage === "Shared with me") params.set("view", "shared");
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/files${query}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.success || !Array.isArray(payload.files)) {
      throw new Error(payload.message || "Unable to refresh files");
    }

    const refreshedFiles = payload.files.map(formatFile);
    setState((current) => ({
      ...current,
      files: dedupeResources([
        ...current.files.filter((file) => file.parentId !== parentId || (activePage === "Shared with me" ? isOwner(file) : !isOwner(file))),
        ...refreshedFiles.filter(Boolean),
      ]),
    }));
  }

  function nameConflict(name, parentId, itemId) {
    return [...liveFolders, ...liveFiles].some(
      (item) => item.id !== itemId && item.parentId === parentId && item.name.toLowerCase() === name.toLowerCase(),
    );
  }

  function validateName(value, parentId, itemId) {
    const name = value.trim();
    if (!name) return "A name is required.";
    if (!VALID_NAME.test(name)) return 'Names cannot contain < > : " / \\ | ? or *.';
    if (nameConflict(name, parentId, itemId)) return "An item with that name already exists in this folder.";
    return "";
  }

  function validateFileName(value) {
    const name = value.trim();
    if (!name) return "A file name is required.";
    if (!VALID_NAME.test(name)) return 'File names cannot contain < > : " / \\ | ? or *.';
    return "";
  }

  async function createFolder() {
    if (activePage !== "My Drive" && activePage !== "Shared with me") {
      setFailure("Folders can only be created in Drive folders.");
      return;
    }
    if (currentFolder) {
      const parentFolder = folderById.get(currentFolder);
      if (!parentFolder || !canEdit(parentFolder)) {
        setFailure("Editor access is required to create a folder here.");
        return;
      }
    }
    const name = window.prompt("Enter folder name:");
    if (name === null) return;
    const validation = validateName(name, currentFolder, null);
    if (validation) return setFailure(validation);
    const parentId = getApiParentId();
    if (currentFolder && !parentId) {
      return setFailure("This folder is not available on the server yet. Refresh the folder list before creating a folder here.");
    }

    try {
      const response = await fetch(`${API_BASE}/api/folders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: name.trim(), ...(parentId ? { parentId } : {}) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.folder?._id) {
        throw new Error(payload.message || "Unable to create folder");
      }

      const folder = payload.folder;
      setState((current) => ({
        ...current,
        folders: dedupeResources([...current.folders, {
          id: String(folder._id),
          name: folder.name,
          parentId: folder.parentId ? String(folder.parentId) : null,
          kind: "folder",
          createdAt: folder.createdAt,
          updated: folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : "Just now",
          starred: Boolean(folder.starred),
          trashed: Boolean(folder.trashed),
          ownerId: String(folder.ownerId || ""),
          sharedWith: folder.sharedWith || [],
          accessRole: folder.accessRole || null,
          canTrash: Boolean(folder.canTrash),
        }]),
      }));
      showNotice("Folder created successfully.");
    } catch (folderError) {
      setFailure(folderError.message || "Unable to create folder.");
    }
  }

  async function handleFileUpload(event) {
    const uploadedFiles = Array.from(event.target.files || []);
    if (!uploadedFiles.length) return;

    setUploading(true);
    setError("");
    setNotice(`Uploading ${uploadedFiles.length} file${uploadedFiles.length === 1 ? "" : "s"}...`);
    let uploadedCount = 0;
    try {
      if (foldersLoading) {
        throw new Error("Refreshing the folder list. Please try uploading again in a moment.");
      }

      for (const file of uploadedFiles) {
      const validation = validateFileName(file.name);
        if (validation) {
          throw new Error(`${file.name}: ${validation}`);
        }

        const formData = new FormData();
        formData.append("file", file);
      if (currentFolder && !getApiParentId()) {
        throw new Error("This folder is not available on the server yet. Refresh the folder list before uploading here.");
      }
      const apiParentId = getApiParentId();
      if (apiParentId) {
        formData.append("parentId", apiParentId);
      }

        const response = await fetch(`${API_BASE}/api/files`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
          body: formData,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.success || !payload.file) {
          const statusMessage = response.status ? ` (HTTP ${response.status})` : "";
          throw new Error(payload.message ? `${payload.message}${statusMessage}` : `Unable to upload ${file.name}${statusMessage}`);
        }
        uploadedCount += 1;
      }

      await refreshFiles(getApiParentId());
      showNotice(`${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded successfully.`);
    } catch (uploadError) {
      setFailure(uploadError.message || "File upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function getDescendantIds(folderId) {
    const descendants = new Set([folderId]);
    let changed = true;
    while (changed) {
      changed = false;
      folders.forEach((folder) => {
        if (descendants.has(folder.parentId) && !descendants.has(folder.id)) {
          descendants.add(folder.id);
          changed = true;
        }
      });
    }
    return descendants;
  }

  function itemLocation(parentId) {
    const names = [];
    let id = parentId;
    while (id) {
      const folder = folderById.get(id);
      if (!folder) break;
      names.unshift(folder.name);
      id = folder.parentId;
    }
    return names.length ? `My Drive / ${names.join(" / ")}` : "My Drive";
  }

  async function updateItem(item, action, body) {
    const collection = item.kind === "folder" ? "folders" : "files";
    if (!isMongoId(item.id) || (item.kind !== "folder" && item.kind !== "file")) {
      throw new Error("This item has an invalid server ID. Refresh DriveX and try again.");
    }
    const url = action === "star"
      ? `${API_BASE}/api/${collection}/${encodeURIComponent(item.id)}/star`
      : `${API_BASE}/api/${collection}/${encodeURIComponent(item.id)}/${action}`;
    const response = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {}),
    });
    const payload = await response.json().catch(() => ({}));
    if (action === "star") {
      console.debug("Star request:", {
        url,
        status: response.status,
        body: {
          success: payload.success,
          message: payload.message,
          item: payload.item
            ? { id: String(payload.item._id || payload.item.id), starred: Boolean(payload.item.starred) }
            : undefined,
        },
      });
    }
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || `Unable to ${action} item`);
    }
    return payload.item;
  }

  function mergeUpdatedItem(item, updatedItem) {
    const key = item.kind === "folder" ? "folders" : "files";
    const formatted = item.kind === "folder"
      ? {
          id: String(updatedItem._id),
          name: updatedItem.name,
          parentId: updatedItem.parentId ? String(updatedItem.parentId) : null,
          kind: "folder",
          createdAt: updatedItem.createdAt,
          updated: updatedItem.updatedAt ? new Date(updatedItem.updatedAt).toLocaleDateString() : "Just now",
          starred: Boolean(updatedItem.starred),
          trashed: Boolean(updatedItem.trashed),
          ownerId: String(updatedItem.ownerId || item.ownerId || ""),
          sharedWith: updatedItem.sharedWith || item.sharedWith || [],
          accessRole: updatedItem.accessRole || item.accessRole || null,
          canTrash: Boolean(updatedItem.canTrash ?? item.canTrash),
        }
      : formatFile(updatedItem);
    setState((current) => ({
      ...current,
      [key]: dedupeResources(current[key].map((value) => value.id === item.id ? { ...value, ...formatted } : value)),
    }));
  }

  async function renameItem(item) {
    const entered = window.prompt(`Rename ${item.name}:`, item.name);
    if (entered === null) return;
    let name = entered.trim();
    if (item.name.includes(".") && !name.includes(".")) name += `.${item.name.split(".").pop()}`;
    const validation = validateName(name, item.parentId, item.id);
    if (validation) return setFailure(validation);
    try {
      mergeUpdatedItem(item, await updateItem(item, "rename", { name }));
    } catch (renameError) {
      setFailure(renameError.message || "Unable to rename item.");
    }
  }

  async function trashItem(item) {
    if (!window.confirm(`Move "${item.name}" to Trash?`)) return;
    try {
      mergeUpdatedItem(item, await updateItem(item, "trash"));
      if (item.id === currentFolder) setCurrentFolder(null);
    } catch (trashError) {
      setFailure(trashError.message || "Unable to move item to Trash.");
    }
  }

  async function restoreItem(item) {
    try {
      mergeUpdatedItem(item, await updateItem(item, "restore"));
    } catch (restoreError) {
      setFailure(restoreError.message || "Unable to restore item.");
    }
  }

  async function permanentlyDelete(item) {
    if (!window.confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/${item.type === "folder" ? "folders" : "files"}/${encodeURIComponent(item.id)}/permanent`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to delete item");
      setState((current) => ({
        ...current,
        [item.type === "folder" ? "folders" : "files"]: current[item.type === "folder" ? "folders" : "files"].filter((value) => value.id !== item.id),
      }));
    } catch (deleteError) {
      setFailure(deleteError.message || "Unable to permanently delete item.");
    }
  }

  async function toggleStar(item) {
    try {
      const starred = !item.starred;
      const updatedItem = await updateItem(item, "star", { starred });
      mergeUpdatedItem(item, updatedItem);
      showNotice(`${item.kind === "folder" ? "Folder" : "File"} ${starred ? "starred" : "removed from Starred"} successfully.`);
    } catch (starError) {
      setFailure(starError.message || "Unable to update Starred.");
    }
  }

  function emptyTrash() {
    if (!window.confirm("Empty Trash permanently? This cannot be undone.")) return;
    const trashedItems = [
      ...folders.filter((folder) => folder.trashed).map((folder) => ({ ...folder, type: "folder" })),
      ...files.filter((file) => file.trashed).map((file) => ({ ...file, type: "file" })),
    ];
    Promise.all(trashedItems.map((item) => fetch(`${API_BASE}/api/${item.type === "folder" ? "folders" : "files"}/${encodeURIComponent(item.id)}/permanent`, {
      method: "DELETE",
      credentials: "include",
      headers: { Accept: "application/json" },
    }))).then(async (responses) => {
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error("Unable to empty Trash.");
      setState((current) => ({
        ...current,
        folders: current.folders.filter((folder) => !folder.trashed),
        files: current.files.filter((file) => !file.trashed),
      }));
    }).catch((trashError) => setFailure(trashError.message || "Unable to empty Trash."));
  }

  async function moveItem(item, destinationId) {
    if (item.type === "folder" && (destinationId === item.id || getDescendantIds(item.id).has(destinationId))) {
      return setFailure("A folder cannot be moved into itself or one of its descendants.");
    }
    if (nameConflict(item.name, destinationId, item.id)) return setFailure("An item with that name already exists at the destination.");
    try {
      mergeUpdatedItem(item, await updateItem(item, "move", { parentId: destinationId }));
      setMoveTarget(null);
    } catch (moveError) {
      setFailure(moveError.message || "Unable to move item.");
    }
  }

  async function downloadFile(file) {
    try {
      const response = await fetch(`${API_BASE}/api/files/${encodeURIComponent(file.id)}/download`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || (response.status === 401 ? "Your session has expired." : "Unable to download file."));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (downloadError) {
      setFailure(downloadError.message || "File download failed.");
    }
  }

  function isOwner(item) {
    return Boolean(item && item.ownerId === String(user.id));
  }

  function canEdit(item) {
    return isOwner(item) || item.accessRole === "editor";
  }

  function canTrash(item) {
    return isOwner(item) || item.canTrash;
  }

  async function openAccess(item) {
    setAccessTarget(item);
    setAccessEntries([]);
    setAccessEmail("");
    setAccessRole("viewer");
    setAccessLoading(true);
    try {
      const collection = getResourceCollection(item);
      const response = await fetch(`${API_BASE}/api/${collection}/${encodeURIComponent(item.id)}/access`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !Array.isArray(payload.access)) {
        throw new Error(getApiErrorMessage(response, payload, "Unable to load access list."));
      }
      setAccessEntries(payload.access);
    } catch (accessError) {
      setAccessTarget(null);
      setFailure(accessError.message || "Unable to load access list.");
    } finally {
      setAccessLoading(false);
    }
  }

  async function saveAccess(event) {
    event.preventDefault();
    const email = accessEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setFailure("Enter a valid registered email address.");
    setAccessSaving(true);
    try {
      const collection = getResourceCollection(accessTarget);
      const response = await fetch(`${API_BASE}/api/${collection}/${encodeURIComponent(accessTarget.id)}/share`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, role: accessRole }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(getApiErrorMessage(response, payload, "Unable to update access."));
      }
      setAccessEntries(payload.access || []);
      setAccessEmail("");
      showNotice(payload.message || "Access updated.");
    } catch (accessError) {
      setFailure(accessError.message || "Unable to update access.");
    } finally {
      setAccessSaving(false);
    }
  }

  async function changeAccessRole(entry, role) {
    try {
      const collection = getResourceCollection(accessTarget);
      const response = await fetch(`${API_BASE}/api/${collection}/${encodeURIComponent(accessTarget.id)}/share/${encodeURIComponent(entry.userId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(getApiErrorMessage(response, payload, "Unable to update role."));
      }
      setAccessEntries(payload.access || []);
      showNotice("Access role updated.");
    } catch (accessError) {
      setFailure(accessError.message || "Unable to update role.");
    }
  }

  async function revokeAccess(entry) {
    if (!window.confirm(`Revoke access for ${entry.email}?`)) return;
    try {
      const collection = getResourceCollection(accessTarget);
      const response = await fetch(`${API_BASE}/api/${collection}/${encodeURIComponent(accessTarget.id)}/share/${encodeURIComponent(entry.userId)}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(getApiErrorMessage(response, payload, "Unable to revoke access."));
      }
      setAccessEntries(payload.access || []);
      showNotice("Access revoked.");
    } catch (accessError) {
      setFailure(accessError.message || "Unable to revoke access.");
    }
  }

  const breadcrumb = [];
  let breadcrumbFolder = currentFolder;
  while (breadcrumbFolder) {
    const folder = folderById.get(breadcrumbFolder);
    if (!folder) break;
    breadcrumb.unshift(folder);
    breadcrumbFolder = folder.parentId;
  }
  const query = search.trim().toLowerCase();
  const inTrash = activePage === "Trash";
  const inStarred = activePage === "Starred";
  const inRecent = activePage === "Recent";
  const inShared = activePage === "Shared with me";
  const ownedFolders = liveFolders.filter((folder) => isOwner(folder));
  const ownedFiles = liveFiles.filter((file) => isOwner(file));
  const recentItems = [...ownedFolders, ...ownedFiles]
  .filter((item) => item.createdAt)
  .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
  .slice(0, 10);
  const visibleFolders = (inTrash ? folders.filter((folder) => folder.trashed && isOwner(folder)) : query ? liveFolders : inShared ? (currentFolder ? liveFolders.filter((folder) => !isOwner(folder) && folder.parentId === currentFolder) : liveFolders.filter((folder) => !isOwner(folder) && folder.sharedRoot)) : inStarred ? ownedFolders.filter((folder) => folder.starred) : inRecent ? recentItems.filter((item) => item.kind === "folder") : ownedFolders.filter((folder) => folder.parentId === currentFolder))
  .filter((folder) => !query || folder.name.toLowerCase().includes(query));
  const visibleFiles = (inTrash ? files.filter((file) => file.trashed && isOwner(file)) : query ? liveFiles : inShared ? (currentFolder ? liveFiles.filter((file) => !isOwner(file) && file.parentId === currentFolder) : liveFiles.filter((file) => !isOwner(file) && file.sharedRoot)) : inStarred ? ownedFiles.filter((file) => file.starred) : inRecent ? recentItems.filter((item) => item.kind === "file") : ownedFiles.filter((file) => file.parentId === currentFolder))
  .filter((file) => !query || file.name.toLowerCase().includes(query) || itemLocation(file.parentId).toLowerCase().includes(query));

  function renderMenu(item) {
    return (
      <details className="action-menu" open={openMenu === item.id}>
        <summary className="icon-button menu-trigger" title="More actions" aria-label={`More actions for ${item.name}`} onClick={(event) => { event.preventDefault(); setOpenMenu((current) => current === item.id ? null : item.id); }}><MoreVertical size={19} /></summary>
        <div className="action-dropdown">
          {inTrash ? (
            <>
              {canEdit(item) && <button onClick={() => { setOpenMenu(null); restoreItem(item); }}><RotateCcw size={16} /><span>Restore</span></button>}
              {isOwner(item) && <button onClick={() => { setOpenMenu(null); permanentlyDelete(item); }}><Trash size={16} /><span>Delete permanently</span></button>}
            </>
          ) : (
            <>
              {item.type !== "folder" && <button onClick={() => { setOpenMenu(null); downloadFile(item); }}><Download size={16} /><span>Download</span></button>}
              {canEdit(item) && <button onClick={() => { setOpenMenu(null); renameItem(item); }}><Pencil size={16} /><span>Rename</span></button>}
              {isOwner(item) && <button onClick={() => { setOpenMenu(null); setMoveTarget(item); }}><Move size={16} /><span>Move</span></button>}
              {isOwner(item) && <button onClick={() => { setOpenMenu(null); toggleStar(item); }}><Star size={16} /> <span>{item.starred ? "Remove from Starred" : "Add to Starred"}</span></button>}
              <button onClick={() => { setOpenMenu(null); openAccess(item); }}><Users size={16} /><span>{isOwner(item) ? "Manage access" : "View access"}</span></button>
              {canTrash(item) && <button onClick={() => { setOpenMenu(null); trashItem(item); }}><Trash2 size={16} /><span>Move to Trash</span></button>}
            </>
          )}
        </div>
      </details>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Menu"><Menu size={21} /></button>
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}><span className="brand-icon"><Cloud size={27} /></span><span>DriveX</span></a>
        <div className="search-box"><Search size={20} /><input type="search" placeholder="Search in DriveX" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button className="icon-button" aria-label="Clear search" onClick={() => setSearch("")}>×</button>}</div>
        <div className="topbar-actions">
          <button className="profile" title={`${user.name || user.email} (${user.email})`} aria-label="Current user profile">{getInitials(user.name, user.email)}</button>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-actions">
            {(activePage === "My Drive" || (currentFolder && canEdit(folderById.get(currentFolder)))) && <button className="new-button" onClick={createFolder}><Plus size={21} /><span>New</span></button>}
            {(activePage === "My Drive" || (activePage === "Shared with me" && currentFolder && canEdit(folderById.get(currentFolder)))) && <button className="new-button upload-button" disabled={uploading} onClick={() => document.getElementById("file-upload").click()}><Upload size={18} /><span>{uploading ? "Uploading..." : "Upload files"}</span></button>}
          </div>
          <nav className="navigation">
            {navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activePage === label ? "active" : ""}`} onClick={() => {
              setOpenMenu(null);
              setActivePage(label);
              setCurrentFolder(null);
              setSearch("");
            }}><Icon size={19} /><span>{label}</span></button>)}
          </nav>
          <div className="storage"><div className="storage-title"><Cloud size={19} /><span>Storage</span></div><div className="storage-track"><div className="storage-used" /></div><p>0 GB of 15 GB used</p><button className="storage-link" onClick={() => { setOpenMenu(null); showNotice("Manage storage is Coming Soon."); }}>Manage storage</button></div>
        </aside>
        <main className="main-content">
          <input id="file-upload" type="file" multiple hidden onChange={handleFileUpload} />
          {(error || notice) && <div className={`error-banner ${notice && !error ? "success-banner" : ""}`} role="status">{error || notice}<button onClick={() => { setError(""); setNotice(""); }} aria-label="Dismiss notification"><X size={16} /></button></div>}
          <div className="page-heading">
            <div><h1>{activePage}</h1><p className="breadcrumb"><button className="breadcrumb-button" onClick={() => { setOpenMenu(null); setCurrentFolder(null); }}>{inShared ? "Shared with me" : "My Drive"}</button>{breadcrumb.map((folder) => <span key={folder.id}> / <button className="breadcrumb-button" onClick={() => { setOpenMenu(null); setCurrentFolder(folder.id); }}>{folder.name}</button></span>)}</p></div>
            <div className="view-toggle"><button className={view === "list" ? "selected" : ""} aria-label="List view" onClick={() => setView("list")}><List size={19} /></button><button className={view === "grid" ? "selected" : ""} aria-label="Grid view" onClick={() => setView("grid")}><Grid2X2 size={18} /></button></div>
          </div>
          {inTrash && <div className="trash-toolbar"><span>Items in Trash are stored in your Drive account.</span><button onClick={emptyTrash}>Empty Trash</button></div>}
          <section className="section"><h2>Folders</h2><div className={`folder-grid ${view === "list" ? "folder-list" : ""}`}>
            {visibleFolders.map((folder) => <div className="folder-card" key={folder.id} onDoubleClick={() => { if (!inTrash) { setOpenMenu(null); setCurrentFolder(folder.id); } }}><Folder size={21} fill="#8ab4f8" color="#6489c8" /><button className="folder-name folder-open" onClick={() => { if (!inTrash) { setOpenMenu(null); setCurrentFolder(folder.id); } }}>{folder.name}</button>{renderMenu({ ...folder, type: "folder" })}</div>)}
            {visibleFolders.length === 0 && <p className="empty-state">{inTrash ? "No folders in Trash." : "No folders found."}</p>}
          </div></section>
          <section className="section files-section"><h2>Files</h2><div className="file-table"><div className="file-row file-header"><span>Name</span><span>Location</span><span>Last modified</span><span>File size</span><span /></div>
            {visibleFiles.map((file) => { const FileIcon = file.type === "image" ? Image : FileText; return <div className="file-row" key={file.id}><div className="file-name" onClick={() => { if (inRecent) downloadFile(file); }}><FileIcon size={20} color={file.type === "image" ? "#3984e8" : "#6b83a6"} /><span>{file.name}</span></div><span className="file-location">{inTrash ? itemLocation(file.originalParentId) : itemLocation(file.parentId)}</span><span className="file-updated">{file.updated}</span><span className="file-size">{file.size}</span><div className="file-actions">{renderMenu(file)}</div></div>; })}
            {visibleFiles.length === 0 && <p className="empty-state">{inTrash ? "No files in Trash." : "No files found."}</p>}
          </div></section>
        </main>
      </div>
      {moveTarget && <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="move-title"><div className="modal-header"><h2 id="move-title">Move “{moveTarget.name}”</h2><button className="icon-button" onClick={() => setMoveTarget(null)} aria-label="Close"><X size={18} /></button></div><p>Select a destination folder.</p><div className="destination-list"><button onClick={() => moveItem(moveTarget, null)}><Folder size={18} />My Drive</button>{liveFolders.filter((folder) => folder.id !== moveTarget.id && isOwner(folder) && !(moveTarget.type === "folder" && getDescendantIds(moveTarget.id).has(folder.id))).map((folder) => <button key={folder.id} onClick={() => moveItem(moveTarget, folder.id)}><Folder size={18} />{itemLocation(folder.parentId)} / {folder.name}</button>)}</div></div></div>}
      {accessTarget && <div className="modal-backdrop" role="presentation"><div className="modal access-modal" role="dialog" aria-modal="true" aria-labelledby="access-title">
        <div className="modal-header"><h2 id="access-title">Manage access</h2><button className="icon-button" onClick={() => setAccessTarget(null)} aria-label="Close"><X size={18} /></button></div>
        <p>Access for <strong>{accessTarget.name}</strong></p>
        {accessLoading ? <div className="access-loading"><div className="spinner" aria-label="Loading access" /></div> : <>
          {isOwner(accessTarget) && <form className="access-form" onSubmit={saveAccess}><input type="email" value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} placeholder="Registered user's email" disabled={accessSaving} /><select value={accessRole} onChange={(event) => setAccessRole(event.target.value)} disabled={accessSaving}><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button type="submit" disabled={accessSaving}>{accessSaving ? "Saving..." : "Share"}</button></form>}
          <div className="access-list">{accessEntries.map((entry) => <div className="access-entry" key={entry.userId}><div><strong>{entry.email}</strong><span>{entry.role === "owner" ? "Owner" : entry.name || entry.role}</span></div>{entry.role !== "owner" && isOwner(accessTarget) && <div className="access-entry-actions"><select value={entry.role} onChange={(event) => changeAccessRole(entry, event.target.value)}><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button type="button" onClick={() => revokeAccess(entry)}>Revoke</button></div>}</div>)}</div>
        </>}
      </div></div>}
    </div>
  );
}





function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!active) return;

        if (response.status === 401) {
          setUser(null);
          return;
        }

        const payload = await response.json();
        if (!response.ok || !payload.success || !payload.user) {
          throw new Error(payload.message || "Unable to load your session");
        }

        setUser(payload.user);
      } catch {
        if (active) {

          setUser(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");

    const { name, email, password } = authForm;
    const isSignup = authMode === "signup";

    if (isSignup && (!name.trim() || name.trim().length < 2)) {
      setAuthError("Name must be at least 2 characters long.");
      return;
    }

    if (!email.trim() || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setAuthSubmitting(true);

    try {
      const endpoint = `${API_BASE}/api/auth/${isSignup ? "signup" : "login"}`;
      const payload = isSignup ? { name: name.trim(), email: email.trim().toLowerCase(), password } : { email: email.trim().toLowerCase(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || "Authentication failed");
      }

      setUser(data.user);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (error) {
      setAuthError(error.message || "Authentication failed.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
    } finally {
      setUser(null);
    }
  }

  if (authLoading) {
    return (
      <div className="auth-shell auth-loading">
        <div className="auth-card loading-card">
          <div className="spinner" aria-label="Loading session" />
          <p>Checking your DriveX session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        onSubmit={handleAuthSubmit}
        isSubmitting={authSubmitting}
        error={authError}
      />
    );
  }

  return <DriveApp user={user} onLogout={handleLogout} />;
}

export default App;
