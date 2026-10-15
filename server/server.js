const mongoose = require("mongoose");
const Folder = require("./models/folder");
const File = require("./models/file");
const FileVersion = require("./models/fileVersion");
const User = require("./models/User");
const { requireAuth } = require("./middleware/auth");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

function parseExpiry(value) {
  const normalized = String(value || "7d").trim().toLowerCase();
  const match = normalized.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 1000 * 60 * 60 * 24 * 7;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const units = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  return amount * (units[unit] || units.d);
}

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: parseExpiry(process.env.JWT_EXPIRES_IN || "7d"),
  };
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function toPublicUser(user) {
  if (!user) return null;

  const plainUser = user.toObject ? user.toObject() : user;

  return {
    id: plainUser._id ? plainUser._id.toString() : plainUser.id,
    name: plainUser.name,
    email: plainUser.email,
    createdAt: plainUser.createdAt,
    updatedAt: plainUser.updatedAt,
  };
}

const uploadDir = path.join(__dirname, "uploads");
const defaultMaxFileSize = 50 * 1024 * 1024;
const configuredMaxFileSize = Number(process.env.MAX_FILE_SIZE);
const maxFileSize =
  Number.isFinite(configuredMaxFileSize) && configuredMaxFileSize > 0
    ? configuredMaxFileSize
    : defaultMaxFileSize;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function getSafeOriginalName(originalName) {
  return path.basename(String(originalName || "").replace(/\\/g, "/")).trim();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}`;
    const safeOriginalName = getSafeOriginalName(file.originalname);
    const safeExtension = path
      .extname(safeOriginalName)
      .replace(/[^a-zA-Z0-9.]/g, "")
      .slice(0, 20);

    cb(null, uniqueName + safeExtension);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});

function getSafeUploadErrorMessage(error) {
  if (!error) {
    return "Failed to create file";
  }

  if (error.name === "ValidationError") {
    return "The uploaded file metadata is invalid";
  }

  if (error.name === "CastError") {
    return "The uploaded file metadata contains an invalid value";
  }

  if (error.code === 11000) {
    return "The uploaded file could not be saved because of a duplicate record";
  }

  if (mongoose.connection.readyState !== 1) {
    return "File storage is temporarily unavailable";
  }

  return isProduction ? "Failed to create file" : `Failed to create file: ${error.message || "unknown server error"}`;
}

function handleSingleFileUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Uploaded file exceeds the allowed size limit",
      });
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: 'Only one file can be uploaded using the "file" field',
      });
    }

    console.error("File upload error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Invalid file upload",
    });
  });
}

function getStoredFileMetadata(file, fileId, versionNumber, uploaderId) {
  return {
    fileId,
    versionNumber,
    storagePath: file.storagePath,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    uploaderId,
  };
}

async function getNextVersionNumber(fileId) {
  const latestVersion = await FileVersion.findOne({ fileId }).sort({ versionNumber: -1 }).select("versionNumber");
  return (latestVersion?.versionNumber || 0) + 1;
}

function getVersionResponse(version, uploader) {
  return {
    id: version._id.toString(),
    versionNumber: version.versionNumber,
    originalName: version.originalName,
    mimeType: version.mimeType,
    size: version.size,
    createdAt: version.createdAt,
    uploader: uploader ? { id: uploader._id.toString(), name: uploader.name, email: uploader.email } : null,
  };
}

async function removeUploadedFile(file) {
  if (!file || !file.path) {
    return;
  }



  try {
    await fs.promises.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Uploaded file cleanup error:", error.message);
    }
  }
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  const rawCookies = req.headers.cookie || "";
  req.cookies = {};

  rawCookies.split(";").forEach((cookie) => {
    if (!cookie.trim()) {
      return;
    }

    const separatorIndex = cookie.indexOf("=");
    const name = separatorIndex >= 0 ? cookie.slice(0, separatorIndex).trim() : cookie.trim();
    const value = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1).trim() : "";

    req.cookies[name] = decodeURIComponent(value);
  });

  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "DriveX backend is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working",
  });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user);

    res.cookie("token", token, buildCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Signup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("_id name email passwordHash createdAt updatedAt");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user);
    res.cookie("token", token, buildCookieOptions());

    return res.json({
      success: true,
      message: "Login successful",
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to log in",
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: toPublicUser(req.user),
  });
});

app.use("/api/folders", requireAuth);
app.use("/api/files", requireAuth);

const validShareRoles = new Set(["viewer", "editor"]);

function isOwner(item, userId) {
  return item && item.ownerId && String(item.ownerId) === String(userId);
}

function getSharedRole(item, userId) {
  const entry = item?.sharedWith?.find((share) => String(share.userId || "") === String(userId || ""));
  return entry ? entry.role : null;
}

function restrictPermission(left, right) {
  if (!left) return right;
  if (!right) return left;
  return left === "viewer" || right === "viewer" ? "viewer" : "editor";
}

async function getFolderAncestors(folderId) {
  const ancestors = [];
  const visited = new Set();
  let currentId = folderId;

  while (currentId && !visited.has(String(currentId))) {
    visited.add(String(currentId));
    const folder = await Folder.findById(currentId);
    if (!folder) break;
    ancestors.push(folder);
    currentId = folder.parentId;
  }

  return ancestors;
}

async function getEffectivePermission(item, userId) {
  if (!item) return null;
  if (isOwner(item, userId)) return "owner";

  let permission = getSharedRole(item, userId);
  const containingFolderId = item.constructor.modelName === "Folder" ? item.parentId : item.parentId;
  const ancestors = await getFolderAncestors(containingFolderId);

  for (const ancestor of ancestors) {
    permission = restrictPermission(permission, getSharedRole(ancestor, userId));
  }

  return permission;
}

async function getPermissionContext(item, userId) {
  const permission = await getEffectivePermission(item, userId);
  if (!permission) return null;

  const inheritedRoots = [];
  const containingFolderId = item.constructor.modelName === "Folder" ? item.parentId : item.parentId;
  for (const ancestor of await getFolderAncestors(containingFolderId)) {
    if (getSharedRole(ancestor, userId)) inheritedRoots.push(ancestor);
  }

  return { permission, inheritedRoots };
}

async function isSharedRoot(item, userId) {
  if (isOwner(item, userId)) {
    return true;
  }

  const ancestors = await getFolderAncestors(item.parentId);
  if (ancestors.some((ancestor) => getSharedRole(ancestor, userId))) {
    return false;
  }

  return Boolean(getSharedRole(item, userId));
}

async function findAccessibleItem(Model, id, userId, { includeTrashed = false } = {}) {
  if (!mongoose.isValidObjectId(id)) return null;
  const item = await Model.findById(id);
  if (!item || (!includeTrashed && item.trashed)) return null;
  return (await getEffectivePermission(item, userId)) ? item : null;
}

async function findAccessibleItems(Model, userId, { includeTrashed = false } = {}) {
  const filter = includeTrashed ? {} : { trashed: false };
  const items = await Model.find(filter).sort({ createdAt: -1 });
  const accessible = [];

  for (const item of items) {
    if ((!item.trashed || isOwner(item, userId)) && (await getEffectivePermission(item, userId))) {
      accessible.push(item);
    }
  }

  return accessible;
}

async function requireEditorOrOwner(item, req, res) {
  const permission = await getEffectivePermission(item, req.user._id);
  if (!permission) {
    res.status(404).json({ success: false, message: "Item not found" });
    return false;
  }
  if (permission !== "owner" && permission !== "editor") {
    res.status(403).json({ success: false, message: "Editor access is required" });
    return false;
  }
  return true;
}

async function requireEditableParent(parentId, req, res) {
  if (!parentId) {
    // A user's own root is always editable. Shared-folder restrictions apply
    // only when an editor is acting on shared content.
    return null;
  }
  if (!mongoose.isValidObjectId(parentId)) {
    res.status(400).json({ success: false, message: "Invalid parent folder ID" });
    return false;
  }

  const parentFolder = await Folder.findById(parentId);
  if (!parentFolder || parentFolder.trashed) {
    res.status(404).json({ success: false, message: "Parent folder not found" });
    return false;
  }

  const permission = await getEffectivePermission(parentFolder, req.user._id);
  if (!permission) {
    res.status(404).json({ success: false, message: "Parent folder not found" });
    return false;
  }
  if (permission !== "owner" && permission !== "editor") {
    res.status(403).json({ success: false, message: "Editor access is required for this folder" });
    return false;
  }

  return parentFolder;
}

async function requireEditorForMutation(Model, item, req, res) {
  const context = await getPermissionContext(item, req.user._id);
  if (!context) {
    res.status(404).json({ success: false, message: "Item not found" });
    return false;
  }
  if (context.permission === "owner") return true;
  if (context.permission !== "editor") {
    res.status(403).json({ success: false, message: "Editor access is required" });
    return false;
  }

  const isDirectlySharedItem = Boolean(getSharedRole(item, req.user._id));
  if (!context.inheritedRoots.length && isDirectlySharedItem) {
    res.status(403).json({
      success: false,
      message: "This directly shared item cannot be moved to Trash by an editor",
    });
    return false;
  }

  return true;
}

async function toAccessibleResource(item, userId) {
  const context = await getPermissionContext(item, userId);
  const plainItem = item.toObject ? item.toObject() : item;
  return {
    ...plainItem,
    accessRole: context?.permission || null,
    sharedRoot: await isSharedRoot(item, userId),
    canTrash:
      context?.permission === "owner" ||
      (context?.permission === "editor" && context.inheritedRoots.length > 0),
  };
}

function toAccessEntry(item, user) {
  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: "owner",
  };
}

async function getAccessList(item) {
  const shares = item.sharedWith || [];
  const users = await User.find({ _id: { $in: [item.ownerId, ...shares.map((share) => share.userId)] } })
    .select("_id name email");
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));
  const owner = usersById.get(item.ownerId.toString());
  return [
    owner ? toAccessEntry(item, owner) : null,
    ...shares.flatMap((share) => {
      const user = usersById.get(share.userId.toString());
      return user ? [{ userId: user._id.toString(), email: user.email, name: user.name, role: share.role }] : [];
    }),
  ].filter(Boolean);
}

async function shareResource(Model, req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid item ID" });
    }
    const email = String(req.body.email || "").trim().toLowerCase();
    const role = String(req.body.role || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || !validShareRoles.has(role)) {
      return res.status(400).json({ success: false, message: "A valid email and role are required" });
    }

    const item = await Model.findOne({ _id: req.params.id, ownerId: req.user._id, trashed: false });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    const recipient = await User.findOne({ email }).select("_id name email");
    if (!recipient) return res.status(404).json({ success: false, message: "Registered user not found" });
    if (recipient._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot share an item with yourself" });
    }

    const sharedWith = item.sharedWith || [];
    const existing = sharedWith.find(
      (share) => String(share.userId || "") === recipient._id.toString(),
    );
    if (existing) {
      existing.role = role;
    } else {
      item.sharedWith = [...sharedWith, { userId: recipient._id, role }];
    }
    await item.save();
    return res.json({ success: true, message: existing ? "Access updated" : "Item shared successfully", access: await getAccessList(item) });
  } catch (error) {
    console.error("Share resource error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update access" });
  }
}

async function listAccess(Model, req, res) {
  try {
    const item = await findAccessibleItem(Model, req.params.id, req.user._id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, access: await getAccessList(item), canManage: isOwner(item, req.user._id) });
  } catch (error) {
    console.error("List access error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load access list" });
  }
}

async function updateAccess(Model, req, res, action) {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Invalid item or user ID" });
    }
    const item = await Model.findOne({ _id: req.params.id, ownerId: req.user._id, trashed: false });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    const sharedWith = item.sharedWith || [];
    const shareIndex = sharedWith.findIndex(
      (share) => String(share.userId || "") === String(req.params.userId),
    );
    if (shareIndex < 0) return res.status(404).json({ success: false, message: "Access entry not found" });
    if (action === "revoke") {
      sharedWith.splice(shareIndex, 1);
    } else {
      const role = String(req.body.role || "").trim().toLowerCase();
      if (!validShareRoles.has(role)) return res.status(400).json({ success: false, message: "Invalid access role" });
      sharedWith[shareIndex].role = role;
    }
    item.sharedWith = sharedWith;
    await item.save();
    return res.json({ success: true, message: action === "revoke" ? "Access revoked" : "Access updated", access: await getAccessList(item) });
  } catch (error) {
    console.error("Update access error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update access" });
  }
}

for (const [route, Model] of [["folders", Folder], ["files", File]]) {
  app.post(`/api/${route}/:id/share`, (req, res) => shareResource(Model, req, res));
  app.get(`/api/${route}/:id/access`, (req, res) => listAccess(Model, req, res));
  app.patch(`/api/${route}/:id/share/:userId`, (req, res) => updateAccess(Model, req, res, "update"));
  app.delete(`/api/${route}/:id/share/:userId`, (req, res) => updateAccess(Model, req, res, "revoke"));
}

app.post("/api/folders", async (req, res) => {
  try {
    const { name } = req.body;
    const parentId = String(req.body.parentId || "").trim() || null;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 255 || /[<>:"/\\|?*]/.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    if (parentId && !mongoose.isValidObjectId(parentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent folder ID",
      });
    }

    let parentFolder = null;
    parentFolder = await requireEditableParent(parentId, req, res);
    if (parentFolder === false) return;

    const folder = await Folder.create({
      name: name.trim(),
      parentId: parentId || null,
      ownerId: parentFolder ? parentFolder.ownerId : req.user._id,
    });

    res.status(201).json({
      success: true,
      folder: await toAccessibleResource(folder, req.user._id),
    });
  } catch (error) {
    console.error("Create folder error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create folder",
    });
  }
});

app.get("/api/folders", async (req, res) => {
  try {
    const { parentId } = req.query;
    const normalizedParentId = String(parentId || "").trim() || null;
    const includeTrashed = req.query.includeTrashed === "true";
    const sharedView = req.query.view === "shared";
    const hasParentFilter = Object.prototype.hasOwnProperty.call(req.query, "parentId");

    if (normalizedParentId && !mongoose.isValidObjectId(normalizedParentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent folder ID",
      });
    }

    if (hasParentFilter && normalizedParentId) {
      const parentFolder = await findAccessibleItem(Folder, normalizedParentId, req.user._id);
      if (!parentFolder) {
        return res.status(404).json({ success: false, message: "Parent folder not found" });
      }
    }

    let folders = await findAccessibleItems(Folder, req.user._id, { includeTrashed: sharedView ? false : includeTrashed });
    folders = folders.filter((folder) =>
      sharedView
        ? !isOwner(folder, req.user._id)
        : isOwner(folder, req.user._id),
    );
    if (hasParentFilter || (!includeTrashed && !sharedView)) {
      folders = folders.filter((folder) => String(folder.parentId || "") === String(normalizedParentId || ""));
    }
    if (sharedView && !hasParentFilter && req.query.all !== "true") {
      folders = (await Promise.all(
        folders.map(async (folder) => ({ folder, root: await isSharedRoot(folder, req.user._id) })),
      )).filter(({ root }) => root).map(({ folder }) => folder);
    }

    res.json({
      success: true,
      folders: await Promise.all(folders.map((folder) => toAccessibleResource(folder, req.user._id))),
    });
  } catch (error) {
    console.error("List folders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch folders",
    });
  }
});

app.post("/api/files", handleSingleFileUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "A file is required",
    });
  }

  const uploadedFile = req.file;

  try {
    const originalName = getSafeOriginalName(uploadedFile.originalname);
    const parentId = String(req.body.parentId || "").trim() || null;
    const storagePath = path.relative(__dirname, uploadedFile.path);

    if (!isProduction) {
      console.debug("File upload diagnostics:", {
        hasFile: Boolean(req.file),
        hasOriginalName: Boolean(originalName),
        storagePath,
        parentId,
        ownerIdPresent: Boolean(req.user?._id),
        ownerIdValid: mongoose.isValidObjectId(req.user?._id),
        mongoReadyState: mongoose.connection.readyState,
      });
    }

    if (!originalName) {
      await removeUploadedFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "Uploaded file must have a valid name",
      });
    }

    if (originalName.length > 255 || /[<>:"/\\|?*]/.test(originalName)) {
      await removeUploadedFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "Uploaded file name contains invalid characters or is too long",
      });
    }

    if (parentId && !mongoose.isValidObjectId(parentId)) {
      await removeUploadedFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "Invalid parent folder ID",
      });
    }

    let parentFolder = null;
    parentFolder = await requireEditableParent(parentId, req, res);
    if (parentFolder === false) {
      await removeUploadedFile(uploadedFile);
      return;
    }

    const file = await File.create({
      name: originalName,
      originalName,
      mimeType: uploadedFile.mimetype || "application/octet-stream",
      size: uploadedFile.size,
      storagePath,
      parentId,
      ownerId: parentFolder ? parentFolder.ownerId : req.user._id,
      currentUploaderId: req.user._id,
    });

    res.status(201).json({
      success: true,
      file: await toAccessibleResource(file, req.user._id),
    });
  } catch (error) {
    await removeUploadedFile(uploadedFile);
    if (!isProduction) {
      console.error("Create file error:", {
        name: error.name,
        message: error.message,
        code: error.code,
        path: error.path,
        kind: error.kind,
        stack: error.stack,
        mongoReadyState: mongoose.connection.readyState,
      });
    } else {
      console.error("Create file error:", error.message);
    }
    const statusCode = mongoose.connection.readyState === 1 ? 500 : 503;
    res.status(statusCode).json({
      success: false,
      message: getSafeUploadErrorMessage(error),
    });
  }
});

app.get("/api/files", async (req, res) => {
  try {
    const { parentId } = req.query;
    const normalizedParentId = String(parentId || "").trim() || null;
    const includeTrashed = req.query.includeTrashed === "true";
    const sharedView = req.query.view === "shared";
    const hasParentFilter = Object.prototype.hasOwnProperty.call(req.query, "parentId");

    if (normalizedParentId && !mongoose.isValidObjectId(normalizedParentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent folder ID",
      });
    }

    if (hasParentFilter && normalizedParentId) {
      const parentFolder = await findAccessibleItem(Folder, normalizedParentId, req.user._id);
      if (!parentFolder) {
        return res.status(404).json({ success: false, message: "Parent folder not found" });
      }
    }

    let files = await findAccessibleItems(File, req.user._id, { includeTrashed: sharedView ? false : includeTrashed });
    files = files.filter((file) =>
      sharedView
        ? !isOwner(file, req.user._id)
        : isOwner(file, req.user._id),
    );
    if (hasParentFilter || (!includeTrashed && !sharedView)) {
      files = files.filter((file) => String(file.parentId || "") === String(normalizedParentId || ""));
    }
    if (sharedView && !hasParentFilter && req.query.all !== "true") {
      files = (await Promise.all(
        files.map(async (file) => ({ file, root: await isSharedRoot(file, req.user._id) })),
      )).filter(({ root }) => root).map(({ file }) => file);
    }

    res.json({
      success: true,
      files: await Promise.all(files.map((file) => toAccessibleResource(file, req.user._id))),
    });
  } catch (error) {
    console.error("List files error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
    });
  }
});

function resolveStoredFilePath(storagePath) {
  const storageRoot = path.resolve(uploadDir);
  const storedPath = String(storagePath || "");
  const pathSegments = storedPath.split(/[\\/]+/);
  if (pathSegments.includes("..")) {
    return null;
  }

  const candidatePath = path.resolve(__dirname, storedPath);
  const relativePath = path.relative(storageRoot, candidatePath);

  if (
    !relativePath ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  return candidatePath;
}

async function listFileVersions(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const file = await findAccessibleItem(File, req.params.id, req.user._id);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    const versions = await FileVersion.find({ fileId: file._id })
      .sort({ versionNumber: -1 })
      .populate("uploaderId", "_id name email");
    const latestVersion = versions[0]?.versionNumber || 0;
    const currentUploader = await User.findById(file.currentUploaderId || file.ownerId).select("_id name email");
    const currentVersion = {
      id: null,
      versionNumber: latestVersion + 1,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.updatedAt || file.createdAt,
      uploader: currentUploader
        ? { id: currentUploader._id.toString(), name: currentUploader.name, email: currentUploader.email }
        : null,
      isCurrent: true,
    };

    return res.json({
      success: true,
      versions: [
        currentVersion,
        ...versions.map((version) => ({
          ...getVersionResponse(version, version.uploaderId),
          isCurrent: false,
        })),
      ],
    });
  } catch (error) {
    console.error("List file versions error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load version history" });
  }
}

app.get("/api/files/:id/versions", listFileVersions);

app.get("/api/files/:fileId/versions/:versionId/download", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.fileId) || !mongoose.isValidObjectId(req.params.versionId)) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    const file = await findAccessibleItem(File, req.params.fileId, req.user._id);
    if (!file) return res.status(404).json({ success: false, message: "Version not found" });
    const version = await FileVersion.findOne({ _id: req.params.versionId, fileId: file._id });
    if (!version) return res.status(404).json({ success: false, message: "Version not found" });

    const storedFilePath = resolveStoredFilePath(version.storagePath);
    if (!storedFilePath) return res.status(404).json({ success: false, message: "Version not found" });
    const storageRoot = await fs.promises.realpath(uploadDir);
    const resolvedFilePath = await fs.promises.realpath(storedFilePath).catch(() => null);
    const physicalRelativePath = resolvedFilePath ? path.relative(storageRoot, resolvedFilePath) : "";
    if (
      !resolvedFilePath ||
      !physicalRelativePath ||
      physicalRelativePath === ".." ||
      physicalRelativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(physicalRelativePath)
    ) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }
    const stats = await fs.promises.stat(resolvedFilePath);
    if (!stats.isFile()) return res.status(404).json({ success: false, message: "Version not found" });

    return res.download(resolvedFilePath, version.originalName, (error) => {
      if (!error) return;
      console.error("Version download error:", error.message);
      if (!res.headersSent) res.status(error.code === "ENOENT" ? 404 : 500).json({
        success: false,
        message: error.code === "ENOENT" ? "Version not found" : "Failed to download version",
      });
    });
  } catch (error) {
    console.error("Version download error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to download version" });
  }
});

app.post("/api/files/:id/versions", handleSingleFileUpload, async (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) return res.status(400).json({ success: false, message: "A file is required" });

  let createdVersion = null;
  let fileUpdated = false;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      await removeUploadedFile(uploadedFile);
      return res.status(404).json({ success: false, message: "File not found" });
    }
    const file = await File.findById(req.params.id);
    if (!file || file.trashed) {
      await removeUploadedFile(uploadedFile);
      return res.status(404).json({ success: false, message: "File not found" });
    }
    if (!(await requireEditorOrOwner(file, req, res))) {
      await removeUploadedFile(uploadedFile);
      return;
    }

    const originalName = getSafeOriginalName(uploadedFile.originalname);
    if (!originalName || originalName.length > 255 || /[<>:"/\\|?*]/.test(originalName)) {
      await removeUploadedFile(uploadedFile);
      return res.status(400).json({ success: false, message: "Uploaded file name is invalid" });
    }

    const versionNumber = await getNextVersionNumber(file._id);
    const previousVersion = await FileVersion.findOne({ fileId: file._id, versionNumber: versionNumber - 1 });
    if (!previousVersion) {
      createdVersion = await FileVersion.create({
        ...getStoredFileMetadata(file, file._id, versionNumber, file.currentUploaderId || file.ownerId),
      });
    } else {
      createdVersion = await FileVersion.create({
        ...getStoredFileMetadata(file, file._id, versionNumber, req.user._id),
      });
    }

    file.originalName = originalName;
    file.name = originalName;
    file.mimeType = uploadedFile.mimetype || "application/octet-stream";
    file.size = uploadedFile.size;
    file.storagePath = path.relative(__dirname, uploadedFile.path);
    file.currentUploaderId = req.user._id;
    await file.save();
    fileUpdated = true;

    return res.status(201).json({
      success: true,
      message: "New file version uploaded",
      file: await toAccessibleResource(file, req.user._id),
      version: getVersionResponse(createdVersion, req.user),
    });
  } catch (error) {
    if (!fileUpdated) {
      if (createdVersion) await FileVersion.deleteOne({ _id: createdVersion._id }).catch(() => {});
      await removeUploadedFile(uploadedFile);
    }
    console.error("Create file version error:", error.message);
    return res.status(mongoose.connection.readyState === 1 ? 500 : 503).json({
      success: false,
      message: "Failed to create file version",
    });
  }
});

app.post("/api/files/:fileId/versions/:versionId/restore", async (req, res) => {
  let copiedPath = null;
  let createdVersion = null;
  let fileUpdated = false;
  try {
    if (!mongoose.isValidObjectId(req.params.fileId) || !mongoose.isValidObjectId(req.params.versionId)) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }
    const file = await File.findById(req.params.fileId);
    if (!file || file.trashed) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    if (!(await requireEditorOrOwner(file, req, res))) return;
    const selectedVersion = await FileVersion.findOne({ _id: req.params.versionId, fileId: file._id });
    if (!selectedVersion) return res.status(404).json({ success: false, message: "Version not found" });

    const sourcePath = resolveStoredFilePath(selectedVersion.storagePath);
    if (!sourcePath) return res.status(404).json({ success: false, message: "Version contents not found" });
    const storageRoot = await fs.promises.realpath(uploadDir);
    const resolvedSourcePath = await fs.promises.realpath(sourcePath).catch(() => null);
    const sourceRelativePath = resolvedSourcePath ? path.relative(storageRoot, resolvedSourcePath) : "";
    if (
      !resolvedSourcePath ||
      !sourceRelativePath ||
      sourceRelativePath === ".." ||
      sourceRelativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(sourceRelativePath)
    ) {
      return res.status(404).json({ success: false, message: "Version contents not found" });
    }
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(getSafeOriginalName(selectedVersion.originalName))}`;
    copiedPath = path.join(uploadDir, uniqueName);
    await fs.promises.copyFile(resolvedSourcePath, copiedPath);

    const versionNumber = await getNextVersionNumber(file._id);
    createdVersion = await FileVersion.create({
      ...getStoredFileMetadata(file, file._id, versionNumber, file.currentUploaderId || file.ownerId),
    });
    file.originalName = selectedVersion.originalName;
    file.name = selectedVersion.originalName;
    file.mimeType = selectedVersion.mimeType;
    file.size = selectedVersion.size;
    file.storagePath = path.relative(__dirname, copiedPath);
    file.currentUploaderId = req.user._id;
    await file.save();
    fileUpdated = true;

    return res.json({
      success: true,
      message: "Version restored successfully",
      file: await toAccessibleResource(file, req.user._id),
    });
  } catch (error) {
    if (!fileUpdated) {
      if (createdVersion) await FileVersion.deleteOne({ _id: createdVersion._id }).catch(() => {});
      if (copiedPath) await removeUploadedFile({ path: copiedPath });
    }
    console.error("Restore file version error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to restore version" });
  }
});

app.get("/api/files/:id/download", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const file = await findAccessibleItem(File, req.params.id, req.user._id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const storedFilePath = resolveStoredFilePath(file.storagePath);
    if (!storedFilePath) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const storageRoot = await fs.promises.realpath(uploadDir);
    const resolvedFilePath = await fs.promises.realpath(storedFilePath).catch(() => null);
    if (!resolvedFilePath) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const physicalRelativePath = path.relative(storageRoot, resolvedFilePath);
    if (
      !physicalRelativePath ||
      physicalRelativePath === ".." ||
      physicalRelativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(physicalRelativePath)
    ) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const fileStats = await fs.promises.stat(resolvedFilePath);
    if (!fileStats.isFile()) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.download(resolvedFilePath, file.originalName, (error) => {
      if (!error) {
        return;
      }

      console.error("File download error:", error.message);
      if (res.headersSent) {
        return res.end();
      }

      return res.status(error.code === "ENOENT" ? 404 : 500).json({
        success: false,
        message: error.code === "ENOENT" ? "File not found" : "Failed to download file",
      });
    });
  } catch (error) {
    console.error("File download error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to download file",
    });
  }
});

async function renameDocument(Model, req, res) {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 255 || /[<>:"/\\|?*]/.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const item = await findAccessibleItem(Model, req.params.id, req.user._id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }
    if (!(await requireEditorOrOwner(item, req, res))) return;

    const newName = name.trim();

    const conflict = await Model.exists({
      _id: { $ne: item._id },
      ownerId: item.ownerId,
      parentId: item.parentId,
      trashed: false,
      name: {
        $regex: `^${newName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "An item with that name already exists",
      });
    }

    item.name = newName;

    if (Model.modelName === "File") {
      item.originalName = newName;
    }

    await item.save();

    res.json({ success: true, item });
  } catch (error) {
    console.error("Rename error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to rename item",
    });
  }
}

app.patch("/api/folders/:id/rename", (req, res) =>
  renameDocument(Folder, req, res)
);

app.patch("/api/files/:id/rename", (req, res) =>
  renameDocument(File, req, res)
);

async function starDocument(Model, req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    if (typeof req.body.starred !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Starred must be a boolean",
      });
    }

    const item = await Model.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      trashed: false,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.starred = req.body.starred;
    await item.save();
    return res.json({
      success: true,
      message: `${Model.modelName === "Folder" ? "Folder" : "File"} ${item.starred ? "starred" : "removed from Starred"} successfully`,
      item,
    });
  } catch (error) {
    console.error("Star error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update Starred",
    });
  }
}

app.patch("/api/folders/:id/star", (req, res) =>
  starDocument(Folder, req, res)
);

app.patch("/api/files/:id/star", (req, res) =>
  starDocument(File, req, res)
);

async function moveDocument(Model, req, res) {
  try {
    const { parentId } = req.body;

    const item = await Model.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      trashed: false,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (parentId === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "An item cannot be moved into itself",
      });
    }

    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid destination folder ID",
        });
      }

      const destination = await Folder.findOne({
        _id: parentId,
        ownerId: req.user._id,
        trashed: false,
      });

      if (!destination) {
        return res.status(404).json({
          success: false,
          message: "Destination folder not found",
        });
      }

      if (Model.modelName === "Folder") {
        let current = destination;

        while (current) {
          if (current._id.equals(item._id)) {
            return res.status(400).json({
              success: false,
              message: "Cannot move a folder into its descendant",
            });
          }

          if (!current.parentId) break;

          current = await Folder.findOne({
            _id: current.parentId,
            ownerId: req.user._id,
            trashed: false,
          });

          if (!current && destination.parentId) {
            return res.status(400).json({
              success: false,
              message: "Invalid destination folder hierarchy",
            });
          }
        }
      }
    }

    const conflict = await Model.exists({
      _id: { $ne: item._id },
      ownerId: req.user._id,
      parentId: parentId || null,
      trashed: false,
      name: item.name,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "An item with that name already exists",
      });
    }

    item.parentId = parentId || null;
    await item.save();

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Move error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to move item",
    });
  }
}

app.patch("/api/folders/:id/move", (req, res) =>
  moveDocument(Folder, req, res)
);

app.patch("/api/files/:id/move", (req, res) =>
  moveDocument(File, req, res)
);

async function trashDocument(Model, req, res) {
  try {
    const item = await findAccessibleItem(Model, req.params.id, req.user._id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (!(await requireEditorForMutation(Model, item, req, res))) return;

    item.trashed = true;
    await item.save();

    res.json({
      success: true,
      message: "Item moved to Trash",
      item,
    });
  } catch (error) {
    console.error("Trash error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to move item to Trash",
    });
  }
}

app.patch("/api/folders/:id/trash", (req, res) =>
  trashDocument(Folder, req, res)
);

app.patch("/api/files/:id/trash", (req, res) =>
  trashDocument(File, req, res)
);

async function restoreDocument(Model, req, res) {
  try {
    const item = await Model.findOne({ _id: req.params.id, trashed: true });

    if (!item || !(await getEffectivePermission(item, req.user._id))) {
      return res.status(404).json({
        success: false,
        message: "Trashed item not found",
      });
    }

    if (!(await requireEditorForMutation(Model, item, req, res))) return;

    if (item.parentId) {
      const parentFolder = await Folder.findOne({ _id: item.parentId, trashed: false });
      if (!parentFolder) {
        item.parentId = null;
      } else if (!(await getEffectivePermission(parentFolder, req.user._id))) {
        return res.status(403).json({
          success: false,
          message: "You no longer have access to the destination folder",
        });
      }
    }

    item.trashed = false;
    await item.save();

    res.json({
      success: true,
      message: "Item restored successfully",
      item,
    });
  } catch (error) {
    console.error("Restore error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to restore item",
    });
  }
}

app.patch("/api/folders/:id/restore", (req, res) =>
  restoreDocument(Folder, req, res)
);

app.patch("/api/files/:id/restore", (req, res) =>
  restoreDocument(File, req, res)
);

async function permanentlyDeleteDocument(Model, req, res) {
  try {
    const item = await Model.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      trashed: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Trashed item not found",
      });
    }

    await Model.deleteOne({ _id: item._id, ownerId: req.user._id });
    if (Model.modelName === "File") {
      await FileVersion.deleteMany({ fileId: item._id });
    }

    res.json({
      success: true,
      message: "Item permanently deleted",
    });
  } catch (error) {
    console.error("Permanent delete error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete item",
    });
  }
}

app.delete("/api/folders/:id/permanent", (req, res) =>
  permanentlyDeleteDocument(Folder, req, res)
);

app.delete("/api/files/:id/permanent", (req, res) =>
  permanentlyDeleteDocument(File, req, res)
);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/DriveX");
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`DriveX backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.stack || error.message);
    process.exitCode = 1;
  }
}

startServer();
