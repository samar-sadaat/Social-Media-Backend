const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
    followById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followToId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['accepted', 'rejected', 'pending'],
        default: 'pending'
    },
    unfollow: {
        type: Boolean,
        default: false,
    },
    notification: {
      message: { type: String, default: "" },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Connection", ConnectionSchema);
