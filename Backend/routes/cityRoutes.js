const express = require("express");

const router = express.Router();

const City = require("../models/City");



/*
========================================
GET ALL CITIES
========================================
*/

router.get("/", async function (req, res) {

    try {

        const cities = await City.find()

            .sort({
                popularityScore: -1
            });


        res.json({

            success: true,

            total: cities.length,

            cities

        });

    }
    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});






/*
========================================
SEARCH CITY
========================================
*/

router.get("/search", async function (req, res) {

    try {

        const keyword = req.query.keyword || "";


        const cities = await City.find({

            name: {
                $regex: keyword,
                $options: "i"
            }

        });


        res.json({

            success: true,

            total: cities.length,

            cities

        });

    }
    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});







/*
========================================
FILTER CITIES
========================================
*/

router.get("/filter", async function (req, res) {

    try {

        const {
            country,
            region,
            costIndex
        } = req.query;


        let query = {};


        if (country) {

            query.country = country;

        }

        if (region) {

            query.region = region;

        }

        if (costIndex) {

            query.costIndex = costIndex;

        }


        const cities = await City.find(query);


        res.json({

            success: true,

            total: cities.length,

            cities

        });

    }
    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});







/*
========================================
POPULAR CITIES
========================================
*/

router.get("/popular", async function (req, res) {

    try {

        const cities = await City.find()

            .sort({
                popularityScore: -1
            })

            .limit(10);


        res.json({

            success: true,

            cities

        });

    }
    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});








/*
========================================
GET SINGLE CITY
========================================
*/

router.get("/:id", async function (req, res) {

    try {

        const city = await City.findById(
            req.params.id
        );

        if (!city) {

            return res.status(404).json({

                success: false,

                message: "City not found"

            });

        }


        res.json({

            success: true,

            city

        });

    }
    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});



module.exports = router;