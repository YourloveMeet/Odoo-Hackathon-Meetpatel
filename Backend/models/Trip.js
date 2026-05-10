const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({

    userId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    name: {

        type: String,

        required: true,

        trim: true

    },

    description: {

        type: String,

        default: ""

    },

    coverPhoto: {

        type: String,

        default: ""

    },

    startDate: {

        type: Date,

        required: true

    },

    endDate: {

        type: Date,

        required: true

    },

    status: {

        type: String,

        enum: [
            "upcoming",
            "ongoing",
            "completed"
        ],

        default: "upcoming"

    },

    isPublic: {

        type: Boolean,

        default: false

    },

    totalBudget: {

        type: Number,

        default: 0

    },

    totalDays: {

        type: Number,

        default: 0

    },

    tripType: {

        type: String,

        default: "solo"

    },

    currency: {
        type: String,
        default: "INR"
    },

    itinerary: [{
        title: { type: String, required: true },
        description: { type: String, default: "" },
        startDate: { type: Date },
        endDate: { type: Date },
        budget: { type: Number, default: 0 }
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model("Trip", tripSchema);