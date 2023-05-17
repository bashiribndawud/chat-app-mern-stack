import { Schema, model, connect } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, unique: true },
    password: { type: String },
  },
  { timestamps: true }
);

const userModel = model("User", userSchema);
export default userModel;
