const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const ActivityCatalog =
    require("../models/ActivityCatalog");



/*
========================================
GET ALL ACTIVITIES
========================================
*/

router.get(

    "/",

    auth,

    async function (req, res) {

        try {

            const activities =
                await ActivityCatalog.find()

                    .populate("cityId")

                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                total: activities.length,

                activities

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
GET ACTIVITIES BY CITY
========================================
*/

router.get(

    "/city/:cityId",

    auth,

    async function (req, res) {

        try {

            const activities =
                await ActivityCatalog.find({

                    cityId:
                        req.params.cityId

                })

                    .sort({
                        name: 1
                    });


            res.json({

                success: true,

                total: activities.length,

                activities

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
GET ACTIVITIES BY TYPE
========================================
*/

router.get(

    "/type/:type",

    auth,

    async function (req, res) {

        try {

            const activities =
                await ActivityCatalog.find({

                    type:
                        req.params.type

                });


            res.json({

                success: true,

                total: activities.length,

                activities

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
SEARCH ACTIVITIES
========================================
*/

router.get(

    "/search",

    auth,

    async function (req, res) {

        try {

            const keyword =
                req.query.keyword || "";


            const activities =
                await ActivityCatalog.find({

                    name: {

                        $regex: keyword,

                        $options: "i"

                    }

                });


            res.json({

                success: true,

                total: activities.length,

                activities

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
GET ACTIVITY TYPES
========================================
*/

router.get(

    "/types/list",

    auth,

    async function (req, res) {

        try {

            const types =
                await ActivityCatalog.distinct(
                    "type"
                );


            res.json({

                success: true,

                total: types.length,

                types

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
GET SINGLE ACTIVITY
========================================
*/

router.get(

    "/:id",

    auth,

    async function (req, res) {

        try {

            const activity =
                await ActivityCatalog.findById(
                    req.params.id
                )

                    .populate("cityId");


            if (!activity) {

                return res.status(404).json({

                    success: false,

                    message: "Activity not found"

                });

            }


            res.json({

                success: true,

                activity

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