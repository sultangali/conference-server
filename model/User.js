import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    lastname: String, 
    firstname: String, 
    fathername: String, 
    phone: String, 
    organization: String,
    position: String, 
    rank: String,
    degree: String,
    authors: Array,
    section: String, 
    participation_type: {
      type: String,
      enum: ['problem', 'solve']
    },
    participation_form: {
      type: String,
      enum: ['online', 'offline', 'mixed'],
    },
    avatar: String,
    isAdmin: Boolean,
    status: {
      type: String,
      enum: ['accepted', 'denied'],
      default: 'denied',
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", schema);
