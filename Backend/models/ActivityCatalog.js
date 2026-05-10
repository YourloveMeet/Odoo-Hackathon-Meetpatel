const mongoose = require("mongoose");

const activityCatalogSchema = new mongoose.Schema({

    cityId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "City",

        required: true

    },

    name: {

        type: String,

        required: true

    },

    type: {

        type: String,

        enum: [
            "sightseeing",
            "food",
            "adventure",
            "culture",
            "shopping"
        ],

        default: "sightseeing"

    },

    cost: {

        type: Number,

        default: 0

    },

    durationMins: {

        type: Number,

        default: 0

    },

    description: {

        type: String,

        default: ""

    },

    imageUrl: {

        type: String,

        default: ""

    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "ActivityCatalog",
    activityCatalogSchema
);