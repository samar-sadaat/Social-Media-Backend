const express = require( "express" );
const ConnectionRoute = express.Router();
const cors = require('cors');
const verify = require( "../middleware/userMiddleware" );
const ConnectionController = require("../controller/connectionController");

ConnectionRoute.use(express.json());
ConnectionRoute.use(cors());


ConnectionRoute.get("/count", verify, ConnectionController.connectionCount);

ConnectionRoute.get("/status", verify, ConnectionController.checkConnectionStatus);

ConnectionRoute.post("/connect", verify, ConnectionController.connectionCreate);

ConnectionRoute.post('/unfollow', verify, ConnectionController.unfollowUser);

ConnectionRoute.post("/respond", verify, ConnectionController.respondToConnection);

ConnectionRoute.get("/notifications", verify, ConnectionController.getNotifications);


module.exports = ConnectionRoute;
