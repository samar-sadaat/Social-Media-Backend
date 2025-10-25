const express = require('express');
const UserRoute = express.Router();
const cors = require('cors');
const multer = require('multer')
const UserController = require('../controller/userController');
const verify = require('../middleware/userMiddleware');


UserRoute.use(express.json());
UserRoute.use(cors());


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const isValid = /^(image)\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

UserRoute.get("/", UserController.userget);
UserRoute.put("/profile", upload.single('Profile'), verify, UserController.userProfile);
UserRoute.post("/signup", UserController.userSignup);

UserRoute.post("/login", UserController.userlogin);



module.exports = UserRoute;