const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const PackingItem =
    require("../models/PackingItem");



/*
========================================
CREATE PACKING ITEM
========================================
*/

router.post(

    "/create",

    auth,

    async function (req, res) {

        try {

            const {

                tripId,

                category,

                itemName,

                quantity

            } = req.body;


            const item =
                await PackingItem.create({

                    tripId,

                    category,

                    itemName,

                    quantity

                });


            res.status(201).json({

                success: true,

                message:
                    "Packing Item Created",

                item

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
GET PACKING CHECKLIST
========================================
*/

router.get(

    "/checklist/:tripId",

    auth,

    async function (req, res) {

        try {

            const items =
                await PackingItem.find({

                    tripId:
                        req.params.tripId

                });


            // TOTALS
            const totalItems =
                items.length;

            const packedItems =
                items.filter(

                    item => item.isPacked

                ).length;


            // PERCENTAGE
            const progress =

                totalItems > 0

                    ?

                    Math.round(

                        (packedItems / totalItems)

                        * 100

                    )

                    :

                    0;


            // GROUPED DATA
            const grouped = {};


            items.forEach(item => {

                if (!grouped[item.category]) {

                    grouped[item.category] = [];

                }

                grouped[item.category].push(item);

            });


            res.json({

                success: true,

                progress: {

                    totalItems,

                    packedItems,

                    percentage: progress

                },

                checklist: grouped

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
GET ALL PACKING ITEMS
========================================
*/

router.get(

    "/trip/:tripId",

    auth,

    async function (req, res) {

        try {

            const items =
                await PackingItem.find({

                    tripId:
                        req.params.tripId

                });


            res.json({

                success: true,

                total: items.length,

                items

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
TOGGLE PACKED STATUS
========================================
*/

router.put(

    "/toggle/:id",

    auth,

    async function (req, res) {

        try {

            const item =
                await PackingItem.findById(
                    req.params.id
                );

            if (!item) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Item not found"

                });

            }


            item.isPacked =
                !item.isPacked;

            await item.save();


            res.json({

                success: true,

                message:
                    "Packing Status Updated",

                item

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
DELETE PACKING ITEM
========================================
*/

router.delete(

    "/delete/:id",

    auth,

    async function (req, res) {

        try {

            await PackingItem.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message:
                    "Packing Item Deleted"

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