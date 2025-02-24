import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    correspondent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", // Связываем только с корреспондентом
      required: true
    },
    problem: {
      type: String, 
    },
    status: { type: String, enum: ["approved", "process", "denied"], default: "process" },
    file_url: String,
    section: String,
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
