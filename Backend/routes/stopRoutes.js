const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Stop = require("../models/Stop");
const DayPlan = require("../models/DayPlan");

router.post("/create", auth, async (req, res) => {
    try {
        const {
            tripId, fromCityId, toCityId, travelDate,
            arrivalDate, departureDate, orderIndex,
            transportType, transportBudget, stayBudget,
            foodBudget, notes, hotelName, hotelAddress
        } = req.body;

        const stop = await Stop.create({
            tripId, fromCityId, toCityId, travelDate,
            arrivalDate, departureDate, orderIndex,
            transportType, transportBudget, stayBudget,
            foodBudget, notes, hotelName, hotelAddress
        });

        // Automatically create DayPlans based on dates
        const start = new Date(arrivalDate);
        const end = new Date(departureDate);
        const dayPlans = [];
        let current = new Date(start);
        let dayNum = 1;

        while (current <= end) {
            dayPlans.push({
                stopId: stop._id,
                date: new Date(current),
                dayNumber: dayNum
            });
            current.setDate(current.getDate() + 1);
            dayNum++;
        }

        if (dayPlans.length > 0) {
            await DayPlan.insertMany(dayPlans);
        }

        res.status(201).json({ success: true, message: "Stop created successfully", stop });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// We also need a GET to fetch the full itinerary structure for a trip
router.get("/trip/:tripId", auth, async (req, res) => {
    try {
        const stops = await Stop.find({ tripId: req.params.tripId })
            .populate('fromCityId')
            .populate('toCityId')
            .sort({ orderIndex: 1 })
            .lean();
        
        // Fetch day plans and activities for each stop
        const DayPlan = require("../models/DayPlan");
        const Activity = require("../models/Activity");

        for (let stop of stops) {
            const dayPlans = await DayPlan.find({ stopId: stop._id }).sort({ dayNumber: 1 }).lean();
            for (let day of dayPlans) {
                day.activities = await Activity.find({ dayPlanId: day._id }).lean();
            }
            stop.dayPlans = dayPlans;
        }

        res.json({ success: true, stops });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
