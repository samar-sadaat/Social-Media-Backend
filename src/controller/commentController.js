const Comment = require("../models/commentModel");

const getComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = await req.userId

        const Comments = await Comment.find({ postId }).populate("userId", "name profileUrls").sort({ createdAt: -1 });
        res.status(200).json({comments: Comments});
        
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: "Error fetching comments" });
    }
};

const addComment = async (req, res) => {
    const postId = req.params.postId;
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    try {
        const comment = new Comment({
            userId: req.userId,
            text,
            postId,
        });

        const saveComment = await comment.save();

        const io = req.app.get('io');
        io.emit("commentAdded",{postId: postId , comment: saveComment});

        res.status(201).json({ comment: saveComment });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ message: "Error adding comment" });
    }
};

// const deleteComment = async (req, res) => {
//     try {
//         const comment = await Comment.findById(req.params.commentId);
//         if (!comment) return res.status(404).json({ message: "Comment not found" });

//         if (comment.user.id.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Unauthorized" });
//         }

//         await comment.deleteOne();
//         res.json({ message: "Comment deleted successfully" });
//     } catch (err) {
//         console.error("Error deleting comment:", err);
//         res.status(500).json({ message: "Error deleting comment" });
//     }
// };


module.exports = {
    getComments,
    addComment,
    // deleteComment
}