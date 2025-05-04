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
    status: { type: String, enum: ["approved", "revision", "process", "denied"], default: "process" },
    comment: String,
    file_url: String,
    section: String,
    receipt_url: String,
    receipt_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
