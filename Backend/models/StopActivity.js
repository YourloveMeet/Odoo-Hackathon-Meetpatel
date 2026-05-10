const mongoose = require("mongoose");

const stopActivitySchema = new mongoose.Schema({

    dayPlanId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "DayPlan",

        required: true

    },

    catalogId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "ActivityCatalog"

    },

    customName: {

        type: String,

        default: ""

    },

    scheduledTime: {

        type: String,

        default: ""

    },

    cost: {

        type: Number,

        default: 0

    },

    durationMins: {

        type: Number,

        default: 0

    },

    notes: {

        type: String,

        default: ""

    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "StopActivity",
    stopActivitySchema
);