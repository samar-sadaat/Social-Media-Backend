const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Cloudinary = require('../../services/cloudinary').v2;
const streamifier = require('streamifier');
const sharp = require('sharp');
const { v4: uuidv4 } = require("uuid");


const userget = async (req, res) => {
    try {
        const AllUser = await User.find();
        res.json(AllUser)

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const userSignup = async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ status: "error", message: "All fields are required" });
        }
        const findemail = await User.findOne({ email: data.Email });
        if (findemail) {
            return res.status(409).json({ status: "error", message: "Email already exists" });
        }
        const cryptedPass = await bcrypt.hash(data.Password, 10);

        await User.create({
            name: data.Name,
            email: data.Email.toLowerCase(),
            age: data.Age,
            password: cryptedPass,
        });

        return res.send("User Signup Successfully")
    } catch (err) {
        console.error("Error reading file (new signup):", err);
    }
};

const userProfile = async (req, res) => {
    try {

        const userId = req.userId;
        const userData = req.body;
        const user = await User.findById(userId);

        let profileUrls = {};
        let profileType = "image";

        if (req.file) {
            profileType = 'image';
            const buffer = req.file.buffer;

            const sizes = {
                thumbnail: 64,
                small: 128,
                medium: 256,
                large: 512,
            };

            for (const [key, size] of Object.entries(sizes)) {
                const resizedBuffer = await sharp(buffer)
                    .resize(size, size, { fit: "cover" })
                    .toFormat("jpeg")
                    .jpeg({ quality: 90 })
                    .toBuffer();

                const uploadMedia = await new Promise((res, rej) => {
                    const stream = Cloudinary.uploader.upload_stream({
                        folder: 'profiles',
                        public_id: `${userId}_${key}_${uuidv4()}`,
                        resource_type: "image"
                    },
                        (error, result) => {
                            if (error) rej(error);
                            else res(result)
                        })
                    streamifier.createReadStream(resizedBuffer).pipe(stream);
                });
                profileUrls[key] = uploadMedia.secure_url;
            };
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name: userData.name,
                age: userData.age,
                profileUrls,
                profileType,
            },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "Updating failed" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


const userlogin = async (req, res) => {

    try {
        const data = await req.body;
        if (!data) {
            return res.status(500).json({ status: "error", message: "Enter Email or Password" });
        }
        const user = await User.findOne({ email: data.Email });

        if (!user) {
            return res.status(401).json({ status: "error", message: "Invalid Email" });
        }

        const decryptPass = await bcrypt.compare(data.Password, user.password);

        const token = jwt.sign(
            {
                id: user._id
            },
            "screatekeytoken",
            {
                expiresIn: '1h'
            }
        );

        if (decryptPass) {
            res.json({ status: "success", message: `${user.name} Login successful`, token: token, User: user });
        } else {
            return res.status(401).json({ status: "error", message: "Invalid Password" });
        }

    } catch (err) {
        res.status(500).json({ status: "error", message: "Error processing login" });
    }
};


// const teacherDelete = async (req, res) => {

//     try {
//         const  Email  = await req.params.Email;

//         const user = await Teachers.findOneAndDelete({ email: Email });
//         if (!user) {
//             return res.status(404).send("No users found");
//         }

//         res.send(`User with email ${Email} deleted successfully`);
//     } catch (err) {
//         res.status(500).send("Error deleting user" + err.message);
//     }
// };


// const teacherUpdate = async (req, res) =>{
//     try {
//         const data = await req.body;

//         if (!data){
//             return res.status(400).send("Enter Data to Update");
//         }
//         const user = await Teachers.findOneAndUpdate(
//             { email: data.Email, password: data.Password },
//             { name: data.Name, age: data.Age },
//             { new: true }
//         );
//         if (!user) {
//             return res.status(404).send("No users found");
//         }

//         res.send(`User with email ${data.Email} updated successfully`);
//     } catch (err) {
//         res.status(500).send("Error Updating user" + err.message);
//     }
// }

module.exports = {
    userget,
    userSignup,
    userlogin,
    userProfile
};