import mongoose, { mongo } from "mongoose"

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    complete: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        // Here we link the other models, below syntax is mandatory
        // Note: User is same as the export First Parameter Name.
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    // Here we Define the array of subTodos.
    subTodos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubTodo",
        }
    ]
}, {timestamps: true})

export const Todo = mongoose.model("Todo", todoSchema)