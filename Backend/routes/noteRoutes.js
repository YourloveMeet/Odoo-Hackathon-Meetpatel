const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const TripNote =
    require("../models/TripNote");



/*
========================================
CREATE NOTE
========================================
*/

router.post(

    "/create",

    auth,

    async function (req, res) {

        try {

            const {

                tripId,

                title,

                note

            } = req.body;


            const tripNote =
                await TripNote.create({

                    tripId,

                    title,

                    note

                });


            res.status(201).json({

                success: true,

                message:
                    "Note Created",

                tripNote

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
GET NOTES OF TRIP
========================================
*/

router.get(

    "/trip/:tripId",

    auth,

    async function (req, res) {

        try {

            const notes =
                await TripNote.find({

                    tripId:
                        req.params.tripId

                })

                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                total: notes.length,

                notes

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
GET SINGLE NOTE
========================================
*/

router.get(

    "/:id",

    auth,

    async function (req, res) {

        try {

            const note =
                await TripNote.findById(
                    req.params.id
                );

            if (!note) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Note not found"

                });

            }


            res.json({

                success: true,

                note

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
UPDATE NOTE
========================================
*/

router.put(

    "/update/:id",

    auth,

    async function (req, res) {

        try {

            const note =
                await TripNote.findById(
                    req.params.id
                );

            if (!note) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Note not found"

                });

            }


            const {

                title,

                note: noteText

            } = req.body;


            if (title) {

                note.title = title;

            }

            if (noteText) {

                note.note = noteText;

            }


            await note.save();


            res.json({

                success: true,

                message:
                    "Note Updated",

                note

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
DELETE NOTE
========================================
*/

router.delete(

    "/delete/:id",

    auth,

    async function (req, res) {

        try {

            const note =
                await TripNote.findById(
                    req.params.id
                );

            if (!note) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Note not found"

                });

            }


            await TripNote.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message:
                    "Note Deleted"

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