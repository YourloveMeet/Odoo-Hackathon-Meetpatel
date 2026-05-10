const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const StopActivity = require("../models/StopActivity");

const DayPlan = require("../models/DayPlan");
const Stop = require("../models/Stop");

const BudgetItem = require("../models/BudgetItem");


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

            /*
========================================
AUTO CREATE BUDGET ITEM
========================================
*/

            // GET STOP
            const stop = await Stop.findById(
                dayPlan.stopId
            );


            // CREATE BUDGET ITEM
            await BudgetItem.create({

                tripId: stop.tripId,

                stopId: stop._id,

                dayPlanId: dayPlan._id,

                activityId: activity._id,

                category: "activities",

                title:
                    customName ||
                    "Activity Expense",

                description:
                    notes || "",

                amount: Number(cost || 0),

                date: dayPlan.date

            });

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
            /*
            ========================================
            UPDATE DAY PLAN EXPENSE
            ========================================
            */

            const dayPlan =
                await DayPlan.findById(
                    activity.dayPlanId
                );

            if (dayPlan) {

                const difference =

                    Number(activity.cost || 0)

                    -

                    Number(oldCost || 0);


                dayPlan.totalExpense += difference;

                await dayPlan.save();

            }



            /*
            ========================================
            UPDATE BUDGET ITEM
            ========================================
            */

            await BudgetItem.findOneAndUpdate(

                {

                    activityId: activity._id

                },

                {

                    title:
                        activity.customName,

                    description:
                        activity.notes,

                    amount:
                        activity.cost

                }

            );

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

            /*
            ========================================
            DELETE BUDGET ITEM
            ========================================
            */

            await BudgetItem.deleteMany({

                activityId: activity._id

            });
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