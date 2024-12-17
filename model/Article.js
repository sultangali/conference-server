import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    file_url: String,
    section: String,
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);