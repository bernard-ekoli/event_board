import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  favouriteCategories: {
    type: [String],
    enum: ["Music", "Workshop", "Food", "Sports", "Kids"],
    default: [],
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;