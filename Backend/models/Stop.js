const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({

    // TRIP
    tripId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Trip",

        required: true

    },


    // FROM CITY
    fromCityId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "City"

    },


    // TO CITY
    toCityId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "City",

        required: true

    },


    // TRAVEL DATE
    travelDate: {

        type: Date

    },


    // ARRIVAL DATE
    arrivalDate: {

        type: Date,

        required: true

    },


    // DEPARTURE DATE
    departureDate: {

        type: Date,

        required: true

    },


    // DAYS
    totalDays: {

        type: Number,

        default: 0

    },


    // ORDER
    orderIndex: {

        type: Number,

        default: 1

    },


    // TRANSPORT TYPE
    transportType: {

        type: String,

        enum: [
            "flight",
            "train",
            "bus",
            "car",
            "ship"
        ],

        default: "flight"

    },


    // TRANSPORT COST
    transportBudget: {

        type: Number,

        default: 0

    },


    // HOTEL COST
    stayBudget: {

        type: Number,

        default: 0

    },


    // FOOD COST
    foodBudget: {

        type: Number,

        default: 0

    },


    // TOTAL
    totalBudget: {

        type: Number,

        default: 0

    },


    // NOTES
    notes: {

        type: String,

        default: ""

    },


    // HOTEL
    hotelName: {

        type: String,

        default: ""

    },

    hotelAddress: {

        type: String,

        default: ""

    },
    status: {

        type: String,

        enum: [
            "upcoming",
            "ongoing",
            "completed"
        ],

        default: "upcoming"

    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "Stop",
    stopSchema
);