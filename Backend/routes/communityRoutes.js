const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const Trip = require("../models/Trip");

const Stop = require("../models/Stop");

const DayPlan = require("../models/DayPlan");

const StopActivity =
    require("../models/StopActivity");



/*
========================================
COMMUNITY FEED
========================================
*/

router.get(

    "/feed",

    auth,

    async function (req, res) {

        try {

            /*
            ========================================
            GET PUBLIC TRIPS
            ========================================
            */

            const trips =
                await Trip.find({

                    isPublic: true,

                    userId: {
                        $ne: null
                    }

                })

                    .populate({

                        path: "userId",

                        select:
                            "firstName lastName photo"

                    })

                    .sort({
                        createdAt: -1
                    });


            /*
            ========================================
            BUILD FEED
            ========================================
            */

            const feedData = [];


            for (const trip of trips) {

                /*
                ========================================
                SKIP INVALID USER
                ========================================
                */

                if (!trip.userId) {
                    continue;
                }


                /*
                ========================================
                GET STOPS
                ========================================
                */

                const stops =
                    await Stop.find({

                        tripId: trip._id

                    })

                        .populate(
                            "fromCityId",
                            "name"
                        )

                        .populate(
                            "toCityId",
                            "name"
                        )

                        .sort({
                            orderIndex: 1
                        });


                /*
                ========================================
                GET DAY PLANS
                ========================================
                */

                const stopIds =
                    stops.map(

                        stop => stop._id

                    );


                const dayPlans =
                    await DayPlan.find({

                        stopId: {
                            $in: stopIds
                        }

                    })

                        .sort({
                            dayNumber: 1
                        });


                /*
                ========================================
                GET ACTIVITIES
                ========================================
                */

                const dayPlanIds =
                    dayPlans.map(

                        day => day._id

                    );


                const activities =
                    await StopActivity.find({

                        dayPlanId: {
                            $in: dayPlanIds
                        }

                    })

                        .populate(

                            "catalogId",

                            "name type imageUrl"

                        )

                        .sort({
                            scheduledTime: 1
                        });


                /*
                ========================================
                BUILD NESTED STOPS
                ========================================
                */

                const nestedStops = [];


                for (const stop of stops) {

                    /*
                    ========================================
                    GET DAYS OF STOP
                    ========================================
                    */

                    const stopDays =
                        dayPlans.filter(

                            day =>

                                day.stopId.toString()

                                ===

                                stop._id.toString()

                        );


                    /*
                    ========================================
                    BUILD DAYS
                    ========================================
                    */

                    const nestedDays = [];


                    for (const day of stopDays) {

                        /*
                        ========================================
                        GET ACTIVITIES OF DAY
                        ========================================
                        */

                        const dayActivities =
                            activities.filter(

                                activity =>

                                    activity.dayPlanId.toString()

                                    ===

                                    day._id.toString()

                            );


                        /*
                        ========================================
                        CLEAN ACTIVITIES
                        ========================================
                        */

                        const cleanedActivities =
                            dayActivities.map(activity => ({

                                _id:
                                    activity._id,

                                name:
                                    activity.customName,

                                scheduledTime:
                                    activity.scheduledTime,

                                cost:
                                    activity.cost,

                                durationMins:
                                    activity.durationMins,

                                image:
                                    activity.catalogId?.imageUrl || "",

                                type:
                                    activity.catalogId?.type || ""

                            }));


                        /*
                        ========================================
                        PUSH DAY
                        ========================================
                        */

                        nestedDays.push({

                            _id:
                                day._id,

                            dayNumber:
                                day.dayNumber,

                            date:
                                day.date,

                            totalExpense:
                                day.totalExpense,

                            activities:
                                cleanedActivities

                        });

                    }


                    /*
                    ========================================
                    PUSH STOP
                    ========================================
                    */

                    nestedStops.push({

                        _id:
                            stop._id,

                        fromCity:
                            stop.fromCityId?.name || "",

                        toCity:
                            stop.toCityId?.name || "",

                        travelDate:
                            stop.travelDate,

                        arrivalDate:
                            stop.arrivalDate,

                        departureDate:
                            stop.departureDate,

                        totalDays:
                            stop.totalDays,

                        transportType:
                            stop.transportType,

                        hotelName:
                            stop.hotelName,

                        days:
                            nestedDays

                    });

                }


                /*
                ========================================
                PUSH FEED
                ========================================
                */

                feedData.push({

                    trip: {

                        _id:
                            trip._id,

                        name:
                            trip.name,

                        description:
                            trip.description,

                        coverPhoto:
                            trip.coverPhoto,

                        startDate:
                            trip.startDate,

                        endDate:
                            trip.endDate,

                        totalBudget:
                            trip.totalBudget,

                        totalDays:
                            trip.totalDays,

                        tripType:
                            trip.tripType,

                        currency:
                            trip.currency

                    },


                    user: {

                        _id:
                            trip.userId._id,

                        firstName:
                            trip.userId.firstName,

                        lastName:
                            trip.userId.lastName,

                        photo:
                            trip.userId.photo

                    },


                    stops:
                        nestedStops

                });

            }


            /*
            ========================================
            RESPONSE
            ========================================
            */

            res.json({

                success: true,

                total:
                    feedData.length,

                feed:
                    feedData

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
GET SINGLE COMMUNITY TRIP
========================================
*/

router.get(

    "/trip/:tripId",

    auth,

    async function (req, res) {

        try {

            /*
            ========================================
            GET TRIP
            ========================================
            */

            const trip =
                await Trip.findById(

                    req.params.tripId

                )

                    .populate({

                        path: "userId",

                        select:
                            "firstName lastName photo"

                    });


            if (!trip) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Trip not found"

                });

            }


            /*
            ========================================
            PRIVATE CHECK
            ========================================
            */

            if (

                !trip.isPublic &&

                trip.userId &&

                trip.userId._id.toString()
                !== req.user.id

            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This trip is private"

                });

            }


            /*
            ========================================
            GET STOPS
            ========================================
            */

            const stops =
                await Stop.find({

                    tripId: trip._id

                })

                    .populate(
                        "fromCityId",
                        "name"
                    )

                    .populate(
                        "toCityId",
                        "name"
                    )

                    .sort({
                        orderIndex: 1
                    });


            /*
            ========================================
            GET DAY PLANS
            ========================================
            */

            const stopIds =
                stops.map(

                    stop => stop._id

                );


            const dayPlans =
                await DayPlan.find({

                    stopId: {
                        $in: stopIds
                    }

                })

                    .sort({
                        dayNumber: 1
                    });


            /*
            ========================================
            GET ACTIVITIES
            ========================================
            */

            const dayPlanIds =
                dayPlans.map(

                    day => day._id

                );


            const activities =
                await StopActivity.find({

                    dayPlanId: {
                        $in: dayPlanIds
                    }

                })

                    .populate(

                        "catalogId",

                        "name type imageUrl"

                    );


            /*
            ========================================
            BUILD NESTED STOPS
            ========================================
            */

            const nestedStops = [];


            for (const stop of stops) {

                const stopDays =
                    dayPlans.filter(

                        day =>

                            day.stopId.toString()

                            ===

                            stop._id.toString()

                    );


                const nestedDays = [];


                for (const day of stopDays) {

                    const dayActivities =
                        activities.filter(

                            activity =>

                                activity.dayPlanId.toString()

                                ===

                                day._id.toString()

                        );


                    const cleanedActivities =
                        dayActivities.map(activity => ({

                            _id:
                                activity._id,

                            name:
                                activity.customName,

                            scheduledTime:
                                activity.scheduledTime,

                            cost:
                                activity.cost,

                            durationMins:
                                activity.durationMins,

                            image:
                                activity.catalogId?.imageUrl || "",

                            type:
                                activity.catalogId?.type || ""

                        }));


                    nestedDays.push({

                        _id:
                            day._id,

                        dayNumber:
                            day.dayNumber,

                        date:
                            day.date,

                        totalExpense:
                            day.totalExpense,

                        activities:
                            cleanedActivities

                    });

                }


                nestedStops.push({

                    _id:
                        stop._id,

                    fromCity:
                        stop.fromCityId?.name || "",

                    toCity:
                        stop.toCityId?.name || "",

                    travelDate:
                        stop.travelDate,

                    arrivalDate:
                        stop.arrivalDate,

                    departureDate:
                        stop.departureDate,

                    totalDays:
                        stop.totalDays,

                    transportType:
                        stop.transportType,

                    hotelName:
                        stop.hotelName,

                    days:
                        nestedDays

                });

            }


            /*
            ========================================
            RESPONSE
            ========================================
            */

            res.json({

                success: true,

                communityTrip: {

                    trip: {

                        _id:
                            trip._id,

                        name:
                            trip.name,

                        description:
                            trip.description,

                        coverPhoto:
                            trip.coverPhoto,

                        startDate:
                            trip.startDate,

                        endDate:
                            trip.endDate,

                        totalBudget:
                            trip.totalBudget,

                        totalDays:
                            trip.totalDays,

                        tripType:
                            trip.tripType,

                        currency:
                            trip.currency

                    },


                    user: {

                        _id:
                            trip.userId?._id,

                        firstName:
                            trip.userId?.firstName,

                        lastName:
                            trip.userId?.lastName,

                        photo:
                            trip.userId?.photo

                    },


                    stops:
                        nestedStops

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






/*
========================================
GET SINGLE COMMUNITY TRIP
========================================
*/

router.get(

    "/trip/:tripId",

    auth,

    async function (req, res) {

        try {

            /*
            ========================================
            GET TRIP
            ========================================
            */

            const trip =
                await Trip.findById(

                    req.params.tripId

                )

                    .populate({

                        path: "userId",

                        select:
                            "firstName lastName photo"

                    });


            if (!trip) {

                return res.status(404).json({

                    success: false,

                    message: "Trip not found"

                });

            }


            /*
            ========================================
            PRIVATE CHECK
            ========================================
            */

            if (
                !trip.isPublic &&
                trip.userId._id.toString()
                !== req.user.id
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This trip is private"

                });

            }


            /*
            ========================================
            GET STOPS
            ========================================
            */

            const stops =
                await Stop.find({

                    tripId: trip._id

                })

                    .populate("fromCityId")

                    .populate("toCityId")

                    .sort({
                        orderIndex: 1
                    });


            /*
            ========================================
            GET DAY PLANS
            ========================================
            */

            const stopIds =
                stops.map(

                    stop => stop._id

                );


            const dayPlans =
                await DayPlan.find({

                    stopId: {
                        $in: stopIds
                    }

                });


            /*
            ========================================
            GET ACTIVITIES
            ========================================
            */

            const dayPlanIds =
                dayPlans.map(

                    day => day._id

                );


            const activities =
                await StopActivity.find({

                    dayPlanId: {
                        $in: dayPlanIds
                    }

                })

                    .populate("catalogId");


            /*
            ========================================
            RESPONSE
            ========================================
            */

            res.json({

                success: true,

                communityTrip: {

                    trip,

                    user: trip.userId,

                    stops,

                    dayPlans,

                    activities

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



module.exports = router;