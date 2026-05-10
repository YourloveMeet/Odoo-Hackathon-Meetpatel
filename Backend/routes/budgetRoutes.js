const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const BudgetItem =
    require("../models/BudgetItem");



/*
========================================
FILTER BUDGET
========================================
*/

router.post(

    "/filter",

    auth,

    async function (req, res) {

        try {

            const {

                tripId,

                stopId,

                dayPlanId,

                activityId,

                category

            } = req.body;


            // FILTER OBJECT
            let filter = {};


            if (tripId) {

                filter.tripId = tripId;

            }


            if (stopId) {

                filter.stopId = stopId;

            }


            if (dayPlanId) {

                filter.dayPlanId = dayPlanId;

            }


            if (activityId) {

                filter.activityId = activityId;

            }


            if (category) {

                filter.category = category;

            }


            // GET ITEMS
            const budgetItems =
                await BudgetItem.find(filter)

                    .sort({
                        createdAt: -1
                    });


            // TOTAL
            const totalBudget =
                budgetItems.reduce(

                    (sum, item) =>

                        sum + item.amount,

                    0

                );


            // CATEGORY BREAKDOWN
            let summary = {

                transport: 0,

                stay: 0,

                activities: 0,

                meals: 0,

                shopping: 0,

                tickets: 0,

                other: 0

            };


            budgetItems.forEach(item => {

                if (summary[item.category] !== undefined) {

                    summary[item.category]
                        += item.amount;

                }

            });


            res.json({

                success: true,

                totalItems:
                    budgetItems.length,

                totalBudget,

                summary,

                budgetItems

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