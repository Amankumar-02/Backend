import mongoose from "mongoose";

// mini schema to define difference products
const orderItemSchema = new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema({
    orderPrice: {
        type: Number,
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    orderItems: {
        type: [orderItemSchema],
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        // enum provide Choices to select between
        enum: ["PENDING", "CANCELLED", "DELIVERED"],
        default: "PENDING",
    },
}, {timestamps: true});

export const Order = mongoose.model("Order", orderSchema);