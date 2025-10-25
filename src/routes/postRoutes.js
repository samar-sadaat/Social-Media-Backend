const express = require('express');
const PostRoute = express.Router();
const cors = require('cors');
const multer = require('multer')
const PostController = require('../controller/postController');
const verify = require('../middleware/userMiddleware')

PostRoute.use(express.json());
PostRoute.use(cors());


// media clouadinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = /^(image|video)\/(png|jpe?g|webp|gif|mp4|mov|avi|mkv)$/.test(file.mimetype);
        cb(ok ? null : new Error('Only image or video files are allowed'), ok);
    }
});

PostRoute.get("/", verify, PostController.postget);

PostRoute.get('/count', verify, PostController.postCount);

PostRoute.post("/create", upload.single('File'), verify, PostController.postCreate);

PostRoute.put("/:Id/like", verify, PostController.postLike);

PostRoute.delete('/del/:Id', verify, PostController.postDelete);

PostRoute.patch('/update', verify, PostController.postUpdate);

module.exports = PostRoute;