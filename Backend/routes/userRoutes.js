const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const router = express.Router();

const User = require("../models/User");
const upload = require("../middleware/upload");
const fs = require("fs");



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

                photoUrl =
                    "http://localhost:5000/uploads/users/" +
                    req.file.filename;

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

router.put(

    "/update-profile",

    auth,

    upload.single("photo"),

    async function (req, res) {

        try {

            const userId = req.user.id;

            const user = await User.findById(userId);

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }


            const {
                firstName,
                lastName,
                phoneNumber,
                city,
                country,
                additionalInfo
            } = req.body;


            // UPDATE FIELDS
            if (firstName) {
                user.firstName = firstName;
            }

            if (lastName) {
                user.lastName = lastName;
            }

            if (phoneNumber) {
                user.phoneNumber = phoneNumber;
            }

            if (city) {
                user.city = city;
            }

            if (country) {
                user.country = country;
            }

            if (additionalInfo) {
                user.additionalInfo = additionalInfo;
            }


            // PHOTO UPDATE
            if (req.file) {

                // DELETE OLD PHOTO
                if (user.photo) {

                    const oldImagePath =
                        user.photo.replace(
                            "http://localhost:5000/",
                            ""
                        );

                    if (fs.existsSync(oldImagePath)) {

                        fs.unlinkSync(oldImagePath);

                    }

                }


                // SAVE URL
                user.photo =
                    "http://localhost:5000/uploads/users/" +
                    req.file.filename;
            }


            await user.save();


            res.status(200).json({

                success: true,

                message: "Profile Updated",

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