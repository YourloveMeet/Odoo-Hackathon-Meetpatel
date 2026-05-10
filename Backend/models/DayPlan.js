const mongoose = require("mongoose");

const dayPlanSchema = new mongoose.Schema({
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: "Stop", required: true },
    date: { type: Date, required: true },
    dayNumber: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("DayPlan", dayPlanSchema);
