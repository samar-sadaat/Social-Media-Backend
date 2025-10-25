const Connection = require('../models/connectionModel');

// Count connections
const connectionCount = async (req, res) => {
    try {
        const followById = req.userId;
        const count = await Connection.countDocuments({ followById, unfollow: false });

        res.status(200).json({ success: true, count });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Check if already following
const checkConnectionStatus = async (req, res) => {
    try {
        const { followToId } = req.query;
        const followById = req.userId;

        const connection = await Connection.findOne({ followById, followToId });

        if (!connection) return res.status(200).json({ isFollowing: false });

        const isFollowing = connection.status === "accepted" && connection.unfollow === false;
        res.status(200).json({ isFollowing, status: connection.status });
    } catch (error) {
        console.error("Error checking connection:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Create new connection or re-follow
const connectionCreate = async (req, res) => {
    const { followToId } = req.query;
    const followById = req.userId;

    try {
        const io = req.app.get("io");

        const existingConnection = await Connection.findOne({ followById, followToId });

        if (existingConnection) {
            if (existingConnection.unfollow === true) {
                existingConnection.unfollow = false;
                existingConnection.status = "pending";
                existingConnection.notification = {
                    message: "sent you a new follow request",
                    isRead: false,
                    createdAt: new Date(),
                };
                await existingConnection.save();

                io.to(followToId.toString()).emit("newNotification", {
                    senderId: followById,
                    receiverId: followToId,
                    message: "sent you a new follow request",
                    type: "follow_request",
                    createdAt: new Date(),
                });

                return res.status(200).json({
                    success: true,
                    message: "Follow request re-sent successfully",
                    data: existingConnection,
                });
            }

        }
        // return res.status(409).json({
        //     success: false,
        //     message: "Follow request already exists",
        //     data: existingConnection,
        // });

        const newConnection = await Connection.create({
            followById,
            followToId,
            status: "pending",
            unfollow: false,
            notification: {
                message: "sent you a follow request",
                isRead: false,
                createdAt: new Date(),
            },
        });

        io.to(followToId.toString()).emit("newNotification", {
            senderId: followById,
            receiverId: followToId,
            message: "sent you a follow request",
            type: "follow_request",
            createdAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: "Follow request sent successfully",
            data: newConnection,
        });
    } catch (error) {
        console.error("Error creating connection:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Unfollow user
const unfollowUser = async (req, res) => {
    try {
        const followById = req.userId;
        const { followToId } = req.query;

        if (!followById || !followToId) {
            return res.status(400).json({ message: "Missing follow IDs" });
        }

        const connection = await Connection.findOne({ followById, followToId });
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }

        connection.unfollow = true;
        connection.status = "rejected";
        await connection.save();

        const io = req.app.get("io");
        io.to(followToId.toString()).emit("unfollow", {
            message: "User unfollowed you",
            connection,
        });

        res.status(200).json({
            message: "Unfollowed successfully",
            connection,
        });
    } catch (error) {
        console.error("Error in unfollowUser:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Accept or reject connection
const respondToConnection = async (req, res) => {
    const { connectionId, action } = req.body;
    const userId = req.userId;

    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) return res.status(404).json({ message: "Connection not found" });

        if (connection.followToId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        connection.status = action === "accept" ? "accepted" : "rejected";
        connection.notification = {
            message:
                action === "accept"
                    ? "Your follow request was accepted"
                    : "Your follow request was rejected",
            isRead: false,
            createdAt: new Date(),
        };

        await connection.save();

        const io = req.app.get("io");
        io.to(connection.followById.toString()).emit("newNotification", {
            senderId: userId,
            receiverId: connection.followById,
            message:
                action === "accept"
                    ? "accepted your follow request"
                    : "rejected your follow request",
            type: action,
            createdAt: new Date(),
        });

        res.status(200).json({
            success: true,
            message:
                action === "accept"
                    ? "Follow request accepted"
                    : "Follow request rejected",
            data: connection,
        });
    } catch (error) {
        console.error("Error responding to connection:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;

        const notifications = await Connection.find({
            followToId: userId,
            "notification.message": { $ne: "" },
        })
            .sort({ "notification.createdAt": -1 })
            .populate("followById", "name profilePic");

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    connectionCount,
    connectionCreate,
    unfollowUser,
    checkConnectionStatus,
    respondToConnection,
    getNotifications,
};
