
const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    starred: {
      type: Boolean,
      default: false,
    },
    trashed: {
      type: Boolean,
      default: false,
    },
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["viewer", "editor"],
        required: true,
      },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Folder", folderSchema);
