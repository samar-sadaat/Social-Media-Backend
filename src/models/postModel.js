const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
    },
    mediaUrl: { type: String },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('Post', PostSchema);