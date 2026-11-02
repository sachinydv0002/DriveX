const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    versionNumber: { type: Number, required: true, min: 1 },

    // Each version keeps its own S3 object key. storagePath supports legacy versions.
    s3Key: { type: String, default: "", trim: true },
    storagePath: { type: String, default: "" },

    originalName: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

fileVersionSchema.index({ fileId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model("FileVersion", fileVersionSchema);
