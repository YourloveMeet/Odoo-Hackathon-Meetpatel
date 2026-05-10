const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    fromCityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    toCityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    travelDate: { type: Date },
    arrivalDate: { type: Date },
    departureDate: { type: Date },
    orderIndex: { type: Number, default: 1 },
    transportType: { type: String },
    transportBudget: { type: Number, default: 0 },
    stayBudget: { type: Number, default: 0 },
    foodBudget: { type: Number, default: 0 },
    notes: { type: String },
    hotelName: { type: String },
    hotelAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Stop", stopSchema);
