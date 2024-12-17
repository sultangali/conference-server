import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['todo', 'inProgress', 'done'],
        default: 'todo',
    }
}, {timestamps: true})

export default mongoose.model('Todo', schema)
