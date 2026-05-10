const mongoose = require("mongoose");

const tripNoteSchema =
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

            ref: "Stop",

            default: null

        },


        // DAY PLAN
        dayPlanId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "DayPlan",

            default: null

        },


        // ACTIVITY
        activityId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "StopActivity",

            default: null

        },


        // TITLE
        title: {

            type: String,

            default: ""

        },


        // NOTE
        note: {

            type: String,

            required: true

        },


        // TYPE
        noteType: {

            type: String,

            enum: [

                "trip",

                "stop",

                "day",

                "activity"

            ],

            default: "trip"

        }

    }, {

        timestamps: true

    });

module.exports = mongoose.model(
    "TripNote",
    tripNoteSchema
);