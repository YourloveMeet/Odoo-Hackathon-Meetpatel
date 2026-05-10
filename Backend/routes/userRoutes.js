const express = require("express");

const router = express.Router();

const User = require("../models/User");


// CREATE USER
router.post("/register", async function (req, res) {

    try {

        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        res.json({
            success: true,
            message: "User Created",
            data: user
        });

    }
    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// GET USERS
router.get("/", async function (req, res) {

    try {

        const users = await User.find();

        res.json({
            success: true,
            data: users
        });

    }
    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// DELETE USER
router.delete("/:id", async function (req, res) {

    try {

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "User Deleted"
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