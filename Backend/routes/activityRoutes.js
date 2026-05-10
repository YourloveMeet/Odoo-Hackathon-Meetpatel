const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Activity = require("../models/Activity");

router.post("/create", auth, async (req, res) => {
    try {
        const {
            dayPlanId, catalogId, customName,
            scheduledTime, cost, durationMins, notes
        } = req.body;

        const activity = await Activity.create({
            dayPlanId, catalogId, customName,
            scheduledTime, cost, durationMins, notes
        });

        res.status(201).json({ success: true, message: "Activity created successfully", activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
