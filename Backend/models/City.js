const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({

    name: {

        type: String,

        required: true,

        trim: true

    },

    country: {

        type: String,

        required: true

    },

    region: {

        type: String,

        required: true

    },

    costIndex: {

        type: String,

        enum: [
            "low",
            "medium",
            "high"
        ],

        default: "medium"

    },

    popularityScore: {

        type: Number,

        default: 0

    },

    imageUrl: {

        type: String,

        default: ""

    },

    description: {

        type: String,

        default: ""

    },


    // OPTIONAL EXTRA FIELDS


    famousFor: {

        type: [String],

        default: []

    },

    averageDailyBudget: {

        type: Number,

        default: 0

    },

    currency: {

        type: String,

        default: "USD"

    },

    timezone: {

        type: String,

        default: ""

    },

    language: {

        type: String,

        default: ""

    }

}, {

    timestamps: true

});

module.exports = mongoose.model("City", citySchema);