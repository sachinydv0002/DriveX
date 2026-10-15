const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;

    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }

    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
