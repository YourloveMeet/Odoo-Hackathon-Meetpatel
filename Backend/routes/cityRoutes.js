const express = require("express");
const router = express.Router();
const City = require("../models/City");

// Seed some basic cities if empty, then return
router.get("/", async (req, res) => {
    try {
        let cities = await City.find();
        if (cities.length === 0) {
            const seedCities = [
                { name: "New York", country: "USA" },
                { name: "London", country: "UK" },
                { name: "Paris", country: "France" },
                { name: "Tokyo", country: "Japan" },
                { name: "Dubai", country: "UAE" },
                { name: "Ahmedabad", country: "India" }
            ];
            await City.insertMany(seedCities);
            cities = await City.find();
        }
        res.json({ success: true, cities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
