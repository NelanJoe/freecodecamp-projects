import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  username: String,
});

export const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  description: { type: String, require: true },
  duration: { type: String, require: true },
  date: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
export const Exercise = mongoose.model("Exercise", exerciseSchema);
