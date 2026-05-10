const mongoose = require("mongoose");

const tripNoteSchema =
    new mongoose.Schema({

        // TRIP
        tripId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Trip",

            required: true

        },


        // TITLE
        title: {

            type: String,

            default: ""

        },


        // NOTE CONTENT
        note: {

            type: String,

            required: true

        }

    }, {

        timestamps: true

    });

module.exports = mongoose.model(
    "TripNote",
    tripNoteSchema
);