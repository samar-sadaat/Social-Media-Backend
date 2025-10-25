const Reply = require("../models/replyModel");

const getReply = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = await req.userId

        const Allreply = await Reply.find({ commentId }).populate("userId", "name profileUrls").sort({ createdAt: -1 });
        res.status(200).json({ reply: Allreply });
        
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: "Error fetching comments" });
    }
};

const addReply = async (req, res) => {
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    try {
        const reply = new Reply({
            userId: req.userId,
            commentId,
            text,
        });

        const saveReply = await reply.save();

        const io = req.app.get('io');
        io.emit("replyAdded",{commentId: commentId , reply: saveReply});

        res.status(201).json({ reply: saveReply });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ message: "Error adding comment" });
    }
};


module.exports = {
    getReply,
    addReply,
}