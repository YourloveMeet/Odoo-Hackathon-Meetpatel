const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const Stop = require("../models/Stop");

const Trip = require("../models/Trip");
const BudgetItem = require("../models/BudgetItem");
const DayPlan =
    require("../models/DayPlan");

const StopActivity =
    require("../models/StopActivity");

/*
========================================
CREATE STOP
========================================
*/

router.post(

    "/create",

    auth,

    async function (req, res) {

        try {

            const {

                tripId,

                fromCityId,

                toCityId,

                travelDate,

                arrivalDate,

                departureDate,

                orderIndex,

                transportType,

                transportBudget,

                stayBudget,

                foodBudget,

                notes,

                hotelName,

                hotelAddress

            } = req.body;


            // CHECK TRIP
            const trip = await Trip.findById(tripId);

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


            // TOTAL DAYS
            const start = new Date(arrivalDate);

            const end = new Date(departureDate);

            const totalDays =
                Math.ceil(
                    (end - start) /
                    (1000 * 60 * 60 * 24)
                ) + 1;


            // TOTAL BUDGET
            const totalBudget =

                Number(transportBudget || 0) +

                Number(stayBudget || 0) +

                Number(foodBudget || 0);


            // STATUS
            let status = "upcoming";

            const today = new Date();

            if (today >= start && today <= end) {

                status = "ongoing";

            }
            else if (today > end) {

                status = "completed";

            }


            // CREATE STOP
            const stop = await Stop.create({

                tripId,

                fromCityId,

                toCityId,

                travelDate,

                arrivalDate,

                departureDate,

                totalDays,

                orderIndex,

                transportType,

                transportBudget,

                stayBudget,

                foodBudget,

                totalBudget,

                notes,

                hotelName,

                hotelAddress,

                status

            });

            // AUTO CREATE BUDGET ITEMS

            // TRANSPORT
            if (transportBudget > 0) {

                await BudgetItem.create({

                    tripId,

                    stopId: stop._id,

                    category: "transport",

                    title: "Transport Budget",

                    description:
                        transportType + " transport expense",

                    amount: transportBudget,

                    date: travelDate

                });

            }


            // STAY
            if (stayBudget > 0) {

                await BudgetItem.create({

                    tripId,

                    stopId: stop._id,

                    category: "stay",

                    title: "Hotel Stay",

                    description:
                        hotelName || "Hotel expense",

                    amount: stayBudget,

                    date: arrivalDate

                });

            }


            // FOOD
            if (foodBudget > 0) {

                await BudgetItem.create({

                    tripId,

                    stopId: stop._id,

                    category: "meals",

                    title: "Food Budget",

                    description:
                        "Meals and food expenses",

                    amount: foodBudget,

                    date: arrivalDate

                });

            }


            res.status(201).json({

                success: true,

                message: "Stop Created",

                stop

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
GET ALL STOPS OF TRIP
========================================
*/

router.get(

    "/trip/:tripId",

    auth,

    async function (req, res) {

        try {

            const stops = await Stop.find({

                tripId: req.params.tripId

            })

                .populate("fromCityId")

                .populate("toCityId")

                .sort({
                    orderIndex: 1
                });


            res.json({

                success: true,

                total: stops.length,

                stops

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
GET SINGLE STOP
========================================
*/

router.get(

    "/:id",

    auth,

    async function (req, res) {

        try {

            const stop = await Stop.findById(
                req.params.id
            )

                .populate("fromCityId")

                .populate("toCityId");


            if (!stop) {

                return res.status(404).json({

                    success: false,

                    message: "Stop not found"

                });

            }


            res.json({

                success: true,

                stop

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
UPDATE STOP
========================================
*/

router.put(

    "/update/:id",

    auth,

    async function (req, res) {

        try {

            const stop = await Stop.findById(
                req.params.id
            );

            if (!stop) {

                return res.status(404).json({

                    success: false,

                    message: "Stop not found"

                });

            }


            const {

                fromCityId,

                toCityId,

                travelDate,

                arrivalDate,

                departureDate,

                orderIndex,

                transportType,

                transportBudget,

                stayBudget,

                foodBudget,

                notes,

                hotelName,

                hotelAddress

            } = req.body;


            // UPDATE
            if (fromCityId) {
                stop.fromCityId = fromCityId;
            }

            if (toCityId) {
                stop.toCityId = toCityId;
            }

            if (travelDate) {
                stop.travelDate = travelDate;
            }

            if (arrivalDate) {
                stop.arrivalDate = arrivalDate;
            }

            if (departureDate) {
                stop.departureDate = departureDate;
            }

            if (orderIndex) {
                stop.orderIndex = orderIndex;
            }

            if (transportType) {
                stop.transportType = transportType;
            }

            if (transportBudget) {
                stop.transportBudget = transportBudget;
            }

            if (stayBudget) {
                stop.stayBudget = stayBudget;
            }

            if (foodBudget) {
                stop.foodBudget = foodBudget;
            }

            if (notes) {
                stop.notes = notes;
            }

            if (hotelName) {
                stop.hotelName = hotelName;
            }

            if (hotelAddress) {
                stop.hotelAddress = hotelAddress;
            }


            // RECALCULATE DAYS
            const start = new Date(stop.arrivalDate);

            const end = new Date(stop.departureDate);

            stop.totalDays =
                Math.ceil(
                    (end - start) /
                    (1000 * 60 * 60 * 24)
                ) + 1;


            // RECALCULATE BUDGET
            stop.totalBudget =

                Number(stop.transportBudget || 0) +

                Number(stop.stayBudget || 0) +

                Number(stop.foodBudget || 0);


            // STATUS
            const today = new Date();

            if (today >= start && today <= end) {

                stop.status = "ongoing";

            }
            else if (today > end) {

                stop.status = "completed";

            }
            else {

                stop.status = "upcoming";

            }


            await stop.save();

            // TRANSPORT
            await BudgetItem.findOneAndUpdate(

                {

                    stopId: stop._id,

                    category: "transport"

                },

                {

                    amount: stop.transportBudget,

                    description:
                        stop.transportType +
                        " transport expense"

                }

            );


            // STAY
            await BudgetItem.findOneAndUpdate(

                {

                    stopId: stop._id,

                    category: "stay"

                },

                {

                    amount: stop.stayBudget,

                    description:
                        stop.hotelName ||
                        "Hotel expense"

                }

            );


            // MEALS
            await BudgetItem.findOneAndUpdate(

                {

                    stopId: stop._id,

                    category: "meals"

                },

                {

                    amount: stop.foodBudget

                }

            );


            res.json({

                success: true,

                message: "Stop Updated",

                stop

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
DELETE STOP
========================================
*/

/*
========================================
DELETE STOP
========================================
*/

router.delete(

    "/delete/:id",

    auth,

    async function (req, res) {

        try {

            const stop = await Stop.findById(
                req.params.id
            );

            if (!stop) {

                return res.status(404).json({

                    success: false,

                    message: "Stop not found"

                });

            }


            /*
            ========================================
            GET DAY PLANS
            ========================================
            */

            const dayPlans =
                await DayPlan.find({

                    stopId: stop._id

                });


            /*
            ========================================
            DELETE ACTIVITIES + BUDGETS
            ========================================
            */

            for (const day of dayPlans) {

                const activities =
                    await StopActivity.find({

                        dayPlanId: day._id

                    });


                // DELETE ACTIVITY BUDGETS
                for (const activity of activities) {

                    await BudgetItem.deleteMany({

                        activityId:
                            activity._id

                    });

                }


                // DELETE ACTIVITIES
                await StopActivity.deleteMany({

                    dayPlanId: day._id

                });

            }


            /*
            ========================================
            DELETE DAY PLANS
            ========================================
            */

            await DayPlan.deleteMany({

                stopId: stop._id

            });


            /*
            ========================================
            DELETE STOP BUDGETS
            ========================================
            */

            await BudgetItem.deleteMany({

                stopId: stop._id

            });


            /*
            ========================================
            DELETE STOP
            ========================================
            */

            await Stop.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message: "Stop Deleted"

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