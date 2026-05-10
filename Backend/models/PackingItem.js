const mongoose = require("mongoose");

const packingItemSchema =
    new mongoose.Schema({

        tripId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Trip",

            required: true

        },

        category: {

            type: String,

            enum: [
                "clothing",
                "documents",
                "electronics",
                "medicine",
                "toiletries",
                "other"
            ],

            default: "other"

        },

        itemName: {

            type: String,

            required: true

        },

        quantity: {

            type: Number,

            default: 1

        },

        isPacked: {

            type: Boolean,

            default: false

        }

    }, {

        timestamps: true

    });

module.exports = mongoose.model(
    "PackingItem",
    packingItemSchema
);