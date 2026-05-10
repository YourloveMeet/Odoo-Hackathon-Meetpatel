const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const router = express.Router();

const User = require("../models/User");
const upload = require("../middleware/upload");


// REGISTER API
// REGISTER
router.post(
    "/register",

    upload.single("photo"),

    async function (req, res) {

        try {

            const {
                firstName,
                lastName,
                email,
                phoneNumber,
                city,
                country,
                additionalInfo,
                password
            } = req.body;


            // CHECK USER
            const existingUser = await User.findOne({ email });

            if (existingUser) {

                return res.status(400).json({
                    success: false,
                    message: "User already exists"
                });

            }


            let photoUrl = "";


            // PHOTO UPLOAD
            if (req.file) {

                const compressedImagePath =
                    "uploads/users/compressed-" +
                    req.file.filename;

                // COMPRESS IMAGE
                await sharp(req.file.path)

                    .resize(300)

                    .jpeg({
                        quality: 70
                    })

                    .toFile(compressedImagePath);


                // DELETE ORIGINAL
                fs.unlinkSync(req.file.path);


                photoUrl =
                    "http://localhost:5000/" +
                    compressedImagePath.replace(/\\/g, "/");

            }


            // HASH PASSWORD
            const hashedPassword =
                await bcrypt.hash(password, 10);


            // CREATE USER
            const user = await User.create({

                firstName,
                lastName,
                email,
                phoneNumber,
                city,
                country,
                additionalInfo,

                photo: photoUrl,

                password: hashedPassword

            });


            // TOKEN
            const token = jwt.sign(

                {
                    id: user._id,
                    email: user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


            res.status(201).json({

                success: true,

                message: "Registration Successful",

                token,

                user

            });

        }
        catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    });




// LOGIN API
router.post("/login", async function (req, res) {

    try {

        const { email, password } = req.body;


        // CHECK USER
        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            });

        }


        // CHECK PASSWORD
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });

        }


        // CREATE TOKEN
        const token = jwt.sign(

            {
                id: user._id,
                email: user.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        res.status(200).json({

            success: true,
            message: "Login Successful",

            token,

            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                city: user.city,
                country: user.country
            }

        });

    }
    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

router.get("/profile", auth, async function (req, res) {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        res.json({
            success: true,
            user
        });

    }
    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


module.exports = router;