const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const DayPlan = require("../models/DayPlan");

const Stop = require("../models/Stop");



/*
========================================
CREATE DAY PLAN
========================================
*/

router.post(

    "/create",

    auth,

    async function (req, res) {

        try {

            const {
                stopId,
                dayNumber,
                date
            } = req.body;


            // CHECK STOP
            const stop = await Stop.findById(stopId);

            if (!stop) {

                return res.status(404).json({

                    success: false,

                    message: "Stop not found"

                });

            }


            // CHECK EXISTING DAY
            const existingDay = await DayPlan.findOne({

                stopId,
                dayNumber

            });

            if (existingDay) {

                return res.status(400).json({

                    success: false,

                    message: "Day already exists"

                });

            }


            // CREATE DAY PLAN
            const dayPlan = await DayPlan.create({

                stopId,

                dayNumber,

                date

            });


            res.status(201).json({

                success: true,

                message: "Day Plan Created",

                dayPlan

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
GET ALL DAY PLANS OF STOP
========================================
*/

router.get(

    "/stop/:stopId",

    auth,

    async function (req, res) {

        try {

            const dayPlans = await DayPlan.find({

                stopId: req.params.stopId

            })

                .sort({
                    dayNumber: 1
                });


            res.json({

                success: true,

                total: dayPlans.length,

                dayPlans

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
GET SINGLE DAY PLAN
========================================
*/

router.get(

    "/:id",

    auth,

    async function (req, res) {

        try {

            const dayPlan = await DayPlan.findById(
                req.params.id
            );

            if (!dayPlan) {

                return res.status(404).json({

                    success: false,

                    message: "Day Plan not found"

                });

            }


            res.json({

                success: true,

                dayPlan

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
UPDATE DAY PLAN
========================================
*/

router.put(

    "/update/:id",

    auth,

    async function (req, res) {

        try {

            const dayPlan = await DayPlan.findById(
                req.params.id
            );

            if (!dayPlan) {

                return res.status(404).json({

                    success: false,

                    message: "Day Plan not found"

                });

            }


            const {
                dayNumber,
                date,
                totalExpense
            } = req.body;


            // UPDATE
            if (dayNumber) {
                dayPlan.dayNumber = dayNumber;
            }

            if (date) {
                dayPlan.date = date;
            }

            if (totalExpense) {
                dayPlan.totalExpense = totalExpense;
            }


            await dayPlan.save();


            res.json({

                success: true,

                message: "Day Plan Updated",

                dayPlan

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
DELETE DAY PLAN
========================================
*/

router.delete(

    "/delete/:id",

    auth,

    async function (req, res) {

        try {

            const dayPlan = await DayPlan.findById(
                req.params.id
            );

            if (!dayPlan) {

                return res.status(404).json({

                    success: false,

                    message: "Day Plan not found"

                });

            }


            await DayPlan.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message: "Day Plan Deleted"

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