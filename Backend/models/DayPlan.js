const mongoose = require("mongoose");

const dayPlanSchema = new mongoose.Schema({

    stopId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Stop",

        required: true

    },

    dayNumber: {

        type: Number,

        required: true

    },

    date: {

        type: Date,

        required: true

    },

    totalExpense: {

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
    "DayPlan",
    dayPlanSchema
);