const express = require( "express" );
const CommentRoute = express.Router();
const cors = require('cors');
const verify = require( "../middleware/userMiddleware" );
const CommentController = require("../controller/commentController");

CommentRoute.use(express.json());
CommentRoute.use(cors());


CommentRoute.get("/:postId/comments", verify, CommentController.getComments);

CommentRoute.post("/:postId/comments", verify, CommentController.addComment);

// CommentRoute.delete("/:commentId", verify, CommentController.deleteComment);

module.exports = CommentRoute;
