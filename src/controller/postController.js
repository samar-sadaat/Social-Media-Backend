const Post = require('../models/postModel');
const User = require('../models/userModel');
// const multer = require('multer');
const Cloudinary = require('../../services/cloudinary').v2;
const streamifier = require('streamifier');
// const emailSender = require('nodemailer');
// const bcrypt = require('bcrypt');


const postget = async (req, res) => {
    try {
        const userId = await req.userId;

        const AllPost = await Post.find().populate("userId", "name profileUrls").populate('likes', 'name').sort({ createdAt: -1 });

        const updatedPosts = AllPost.map(post => {
            const isLiked = post.likes.some(Id => Id.toString() === userId);
            return {
                ...post.toObject(),
                isLiked,
                likeCount: post.likes.length,
                likedUsers: post.likes?.slice(0, 2) || []
            };
        });

        res.json({ Userpost: updatedPosts });

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message });
    }
};

const postCount = async (req, res) => {
    try {
        const userId = req.userId;

        const postCount = await Post.countDocuments({ userId });

        const userPosts = await Post.find({ userId }).select("likes");
        const likeCount = userPosts.reduce(
            (acc, post) => acc + (post.likes ? post.likes.length : 0),
            0
        );

        res.status(200).json({
            postCount,
            likeCount,
        });

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message });
    }
};

// // Send email
// async function sendEmail(Email, Name, Password) {
//     const transporter = emailSender.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'sammarsadaat@gmail.com',
//             pass: 'jfil jhjb pfyk cbwo'
//         }
//     });
//     const mailOptions = {
//         from: 'sammarsadaat@gmail.com',
//         to: Email,
//         subject: 'Your Student Account Password',
//         text: `Hi ${Name},\n\nYour student account has been created.\nHere is your password: ${Password}\n\nPlease keep it secure.\n\nRegards,\nTeam`
//     };
//     await transporter.sendMail(mailOptions);
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });

// const upload = multer({ storage }).single("img");


// Combined create controller
const postCreate = async (req, res) => {
    // upload(req, res, async (err) => {
    try {
        // if (err) {
        //     return res.status(400).json({ status: "error", message: "Media upload failed" });
        // }

        let MediaUrl = null;
        let MediaType = null;

        const UserId = req.userId;
        const { Title, Description } = req.body;

        if (!Title || !Description) {
            return res.status(400).json({ status: "error", message: "Fields are required" });
        }

        if (req.file) {
            const isVideo = req.file.mimetype.startsWith('video/');
            MediaType = isVideo ? 'video' : 'image';

            const uploadMedia = await new Promise((res, rej) => {
                const stream = Cloudinary.uploader.upload_stream({
                    folder: 'posts',
                    resource_type: 'auto'
                },
                    (error, result) => {
                        if (error) rej(error);
                        else res(result)
                    })
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            MediaUrl = uploadMedia.secure_url;
        }
        // // Image path from multer
        // const imagePath = req.file ? `${req.file.filename}` : null;

        const postCraete = await Post.create({
            userId: UserId,
            title: Title,
            description: Description,
            mediaUrl: MediaUrl,
            mediaType: MediaType
            // img: imagePath,
        });

        await postCraete.save();

        return res.json({ status: "success", message: "Post Created Successfully", post: postCraete });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
    // });
};

const postLike = async (req, res) => {
    try {
        const postId = req.params.Id;
        const userId = req.userId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        const alreadyLiked = post.likes.includes(userId);
        if (alreadyLiked) {
            post.likes = post.likes.filter(Id => Id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }
        const likeCount = post.likes.length;
        const updatedPost = await post.save();

        const user = await User.findById(userId).select("name profileUrls");


        const io = req.app.get('io');
        io.emit("likeUpdated", {
            postId: postId,
            userName: user.name,
            userId: user._id,  
            userProfileUrl: user.profileUrls.small,
            liked: !alreadyLiked,
            likeCount,
        });

        return res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            liked: !alreadyLiked,
            likeCount,
        });
    } catch (err) {
        console.error("Toggle like error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


const postDelete = async (req, res) => {

    try {
        const RcveId = await req.params.Id;

        const Post = await Post.findOneAndDelete({ RcveId });
        if (!Post) {
            return res.status(404).send("No Post found");
        }

        res.json({ status: "success", message: `Post deleted successfully` });
    } catch (err) {
        res.status(500).send("Error deleting user" + err.message);
    }
};


const postUpdate = async (req, res) => {
    try {
        // const id = await req.params._id
        const data = await req.body;

        if (!data) {
            return res.status(400).send("Enter Data to Update");
        }
        const post = await Post.findOneAndUpdate(
            { userId: data.Id },
            { title: data.Title, description: data.Description, img: data.Image },
            { new: true }
        );
        if (!post) {
            return res.status(404).send("No post found");
        }

        res.json({ status: "success", message: `Post Updated` });
    } catch (err) {
        res.status(500).send("Error Updating user" + err.message);
    }
}

module.exports = {
    postget,
    postCreate,
    postLike,
    postUpdate,
    postDelete,
    postCount
};