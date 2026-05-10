const mongoose = require("mongoose");

const budgetItemSchema =
    new mongoose.Schema({

        // TRIP
        tripId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Trip",

            required: true

        },


        // STOP
        stopId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Stop"

        },


        // DAY PLAN
        dayPlanId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "DayPlan"

        },


        // ACTIVITY
        activityId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "StopActivity"

        },


        // CATEGORY
        category: {

            type: String,

            enum: [
                "transport",
                "stay",
                "activities",
                "meals",
                "shopping",
                "tickets",
                "other"
            ],

            default: "other"

        },


        // TITLE
        title: {

            type: String,

            default: ""

        },


        // DESCRIPTION
        description: {

            type: String,

            default: ""

        },


        // AMOUNT
        amount: {

            type: Number,

            required: true

        },


        // DATE
        date: {

            type: Date,

            default: Date.now

        }

    }, {

        timestamps: true

    });

module.exports = mongoose.model(
    "BudgetItem",
    budgetItemSchema
);