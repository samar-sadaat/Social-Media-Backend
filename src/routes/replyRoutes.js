const express = require( "express" );
const ReplyRoute = express.Router();
const cors = require('cors');
const verify = require( "../middleware/userMiddleware" );
const ReplyController = require("../controller/replyController");

ReplyRoute.use(express.json());
ReplyRoute.use(cors());


ReplyRoute.get("/:commentId/replycomment", verify, ReplyController.getReply);

ReplyRoute.post("/:commentId/replycomment", verify, ReplyController.addReply);


module.exports = ReplyRoute;
