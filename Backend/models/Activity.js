const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    dayPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "DayPlan", required: true },
    catalogId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityCatalog" }, // Optional reference to a catalog if it exists
    customName: { type: String, required: true },
    scheduledTime: { type: String },
    cost: { type: Number, default: 0 },
    durationMins: { type: Number },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
