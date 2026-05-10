const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const upload = require("../middleware/tripUpload");

const fs = require("fs");

const Trip = require("../models/Trip");



/*
========================================
CREATE TRIP
========================================
*/

router.post(

    "/create",

    auth,

    upload.single("coverPhoto"),

    async function (req, res) {

        try {

            const {
                name,
                description,
                startDate,
                endDate,
                isPublic,
                totalBudget,
                tripType,
                currency
            } = req.body;


            // TOTAL DAYS
            const start = new Date(startDate);

            const end = new Date(endDate);

            const totalDays =
                Math.ceil(
                    (end - start) /
                    (1000 * 60 * 60 * 24)
                ) + 1;


            // STATUS
            let status = "upcoming";

            const today = new Date();

            if (today >= start && today <= end) {

                status = "ongoing";

            }
            else if (today > end) {

                status = "completed";

            }


            // PHOTO
            let coverPhoto = "";

            if (req.file) {

                coverPhoto =
                    "http://localhost:5000/uploads/trips/" +
                    req.file.filename;

            }


            // CREATE TRIP
            const trip = await Trip.create({

                userId: req.user.id,

                name,

                description,

                coverPhoto,

                startDate,

                endDate,

                status,

                isPublic,

                totalBudget,

                totalDays,

                tripType,

                currency

            });


            res.status(201).json({

                success: true,

                message: "Trip Created",

                trip

            });

        }
        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    });




/*
========================================
GET MY TRIPS
========================================
*/

router.get(

    "/my-trips",

    auth,

    async function (req, res) {

        try {

            const trips = await Trip.find({

                userId: req.user.id

            })

                .sort({
                    createdAt: -1
                });


            res.json({

                success: true,

                trips

            });

        }
        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    });





/*
========================================
GET SINGLE TRIP
========================================
*/

router.get(

    "/:id",

    auth,

    async function (req, res) {

        try {

            const trip = await Trip.findById(
                req.params.id
            );

            if (!trip) {

                return res.status(404).json({

                    success: false,

                    message: "Trip not found"

                });

            }


            res.json({

                success: true,

                trip

            });

        }
        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    });





/*
========================================
UPDATE TRIP
========================================
*/

router.put(

    "/update/:id",

    auth,

    upload.single("coverPhoto"),

    async function (req, res) {

        try {

            const trip = await Trip.findById(
                req.params.id
            );

            if (!trip) {

                return res.status(404).json({

                    success: false,

                    message: "Trip not found"

                });

            }


            // SECURITY
            if (
                trip.userId.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    success: false,

                    message: "Unauthorized"

                });

            }


            const {
                name,
                description,
                startDate,
                endDate,
                isPublic,
                totalBudget,
                tripType,
                currency
            } = req.body;


            // UPDATE FIELDS
            if (name) {
                trip.name = name;
            }

            if (description) {
                trip.description = description;
            }

            if (startDate) {
                trip.startDate = startDate;
            }

            if (endDate) {
                trip.endDate = endDate;
            }

            if (isPublic !== undefined) {
                trip.isPublic = isPublic;
            }

            if (totalBudget) {
                trip.totalBudget = totalBudget;
            }

            if (tripType) {
                trip.tripType = tripType;
            }

            if (currency) {
                trip.currency = currency;
            }


            // RECALCULATE DAYS
            const start = new Date(trip.startDate);

            const end = new Date(trip.endDate);

            trip.totalDays =
                Math.ceil(
                    (end - start) /
                    (1000 * 60 * 60 * 24)
                ) + 1;


            // STATUS
            const today = new Date();

            if (today >= start && today <= end) {

                trip.status = "ongoing";

            }
            else if (today > end) {

                trip.status = "completed";

            }
            else {

                trip.status = "upcoming";

            }


            // PHOTO UPDATE
            if (req.file) {

                // DELETE OLD IMAGE
                if (trip.coverPhoto) {

                    const oldImagePath =
                        trip.coverPhoto.replace(
                            "http://localhost:5000/",
                            ""
                        );

                    if (fs.existsSync(oldImagePath)) {

                        fs.unlinkSync(oldImagePath);

                    }

                }


                trip.coverPhoto =
                    "http://localhost:5000/uploads/trips/" +
                    req.file.filename;

            }


            await trip.save();


            res.json({

                success: true,

                message: "Trip Updated",

                trip

            });

        }
        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    });





/*
========================================
DELETE TRIP
========================================
*/

router.delete(

    "/delete/:id",

    auth,

    async function (req, res) {

        try {

            const trip = await Trip.findById(
                req.params.id
            );

            if (!trip) {

                return res.status(404).json({

                    success: false,

                    message: "Trip not found"

                });

            }


            // SECURITY
            if (
                trip.userId.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    success: false,

                    message: "Unauthorized"

                });

            }


            // DELETE IMAGE
            if (trip.coverPhoto) {

                const imagePath =
                    trip.coverPhoto.replace(
                        "http://localhost:5000/",
                        ""
                    );

                if (fs.existsSync(imagePath)) {

                    fs.unlinkSync(imagePath);

                }

            }


            await Trip.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message: "Trip Deleted"

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