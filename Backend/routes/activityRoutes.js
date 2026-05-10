const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const StopActivity = require("../models/StopActivity");

const DayPlan = require("../models/DayPlan");



/*
========================================
CREATE ACTIVITY
========================================
*/

router.post(

    "/create",

    auth,

    async function (req, res) {

        try {

            const {

                dayPlanId,

                catalogId,

                customName,

                scheduledTime,

                cost,

                durationMins,

                notes

            } = req.body;


            // CHECK DAY PLAN
            const dayPlan = await DayPlan.findById(
                dayPlanId
            );

            if (!dayPlan) {

                return res.status(404).json({

                    success: false,

                    message: "Day Plan not found"

                });

            }


            // CREATE ACTIVITY
            const activity =
                await StopActivity.create({

                    dayPlanId,

                    catalogId,

                    customName,

                    scheduledTime,

                    cost,

                    durationMins,

                    notes

                });


            // UPDATE TOTAL EXPENSE
            dayPlan.totalExpense += Number(cost || 0);

            await dayPlan.save();


            res.status(201).json({

                success: true,

                message: "Activity Created",

                activity

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
GET ALL ACTIVITIES OF DAY
========================================
*/

router.get(

    "/day/:dayPlanId",

    auth,

    async function (req, res) {

        try {

            const activities =
                await StopActivity.find({

                    dayPlanId:
                        req.params.dayPlanId

                })

                    .populate("catalogId")

                    .sort({
                        scheduledTime: 1
                    });


            res.json({

                success: true,

                total: activities.length,

                activities

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
GET SINGLE ACTIVITY
========================================
*/

router.get(

    "/:id",

    auth,

    async function (req, res) {

        try {

            const activity =
                await StopActivity.findById(
                    req.params.id
                )

                    .populate("catalogId");


            if (!activity) {

                return res.status(404).json({

                    success: false,

                    message: "Activity not found"

                });

            }


            res.json({

                success: true,

                activity

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
UPDATE ACTIVITY
========================================
*/

router.put(

    "/update/:id",

    auth,

    async function (req, res) {

        try {

            const activity =
                await StopActivity.findById(
                    req.params.id
                );

            if (!activity) {

                return res.status(404).json({

                    success: false,

                    message: "Activity not found"

                });

            }


            const {

                customName,

                scheduledTime,

                cost,

                durationMins,

                notes

            } = req.body;


            // UPDATE
            if (customName) {
                activity.customName =
                    customName;
            }

            if (scheduledTime) {
                activity.scheduledTime =
                    scheduledTime;
            }

            if (cost) {
                activity.cost = cost;
            }

            if (durationMins) {
                activity.durationMins =
                    durationMins;
            }

            if (notes) {
                activity.notes = notes;
            }


            await activity.save();


            res.json({

                success: true,

                message: "Activity Updated",

                activity

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
DELETE ACTIVITY
========================================
*/

router.delete(

    "/delete/:id",

    auth,

    async function (req, res) {

        try {

            const activity =
                await StopActivity.findById(
                    req.params.id
                );

            if (!activity) {

                return res.status(404).json({

                    success: false,

                    message: "Activity not found"

                });

            }


            // UPDATE DAY EXPENSE
            const dayPlan =
                await DayPlan.findById(
                    activity.dayPlanId
                );

            if (dayPlan) {

                dayPlan.totalExpense -=
                    Number(activity.cost || 0);

                await dayPlan.save();

            }


            await StopActivity.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message: "Activity Deleted"

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