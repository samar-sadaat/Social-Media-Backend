const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    text: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("Reply", ReplySchema);
