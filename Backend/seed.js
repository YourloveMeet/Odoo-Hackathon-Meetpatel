require("dotenv").config();

const mongoose = require("mongoose");

const City = require("./models/City");

const ActivityCatalog = require("./models/ActivityCatalog");



mongoose.connect(process.env.MONGO_URI)

    .then(async () => {

        console.log("MongoDB Connected");

        await seedActivities();

    })

    .catch((err) => {

        console.log(err);

    });



async function seedActivities() {

    try {

        // GET CITIES
        const cities = await City.find();

        if (cities.length === 0) {

            console.log("No cities found");

            process.exit();

        }


        // OPTIONAL REMOVE OLD DATA
        await ActivityCatalog.deleteMany();


        let activities = [];


        // PARIS
        const paris = cities.find(
            city => city.name === "Paris"
        );

        if (paris) {

            activities.push(

                {
                    cityId: paris._id,
                    name: "Eiffel Tower Visit",
                    type: "sightseeing",
                    cost: 50,
                    durationMins: 120,
                    description: "Visit the iconic Eiffel Tower.",
                    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f"
                },

                {
                    cityId: paris._id,
                    name: "French Food Tour",
                    type: "food",
                    cost: 80,
                    durationMins: 180,
                    description: "Taste authentic French cuisine.",
                    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
                }

            );

        }


        // TOKYO
        const tokyo = cities.find(
            city => city.name === "Tokyo"
        );

        if (tokyo) {

            activities.push(

                {
                    cityId: tokyo._id,
                    name: "Anime District Tour",
                    type: "culture",
                    cost: 40,
                    durationMins: 150,
                    description: "Explore Akihabara anime culture.",
                    imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989"
                },

                {
                    cityId: tokyo._id,
                    name: "Sushi Experience",
                    type: "food",
                    cost: 90,
                    durationMins: 120,
                    description: "Premium sushi tasting.",
                    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c"
                }

            );

        }


        // GOA
        const goa = cities.find(
            city => city.name === "Goa"
        );

        if (goa) {

            activities.push(

                {
                    cityId: goa._id,
                    name: "Beach Party",
                    type: "adventure",
                    cost: 30,
                    durationMins: 240,
                    description: "Enjoy Goa nightlife.",
                    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                },

                {
                    cityId: goa._id,
                    name: "Parasailing",
                    type: "adventure",
                    cost: 60,
                    durationMins: 90,
                    description: "Water sports adventure.",
                    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                }

            );

        }


        // DUBAI
        const dubai = cities.find(
            city => city.name === "Dubai"
        );

        if (dubai) {

            activities.push(

                {
                    cityId: dubai._id,
                    name: "Desert Safari",
                    type: "adventure",
                    cost: 150,
                    durationMins: 300,
                    description: "Luxury desert safari experience.",
                    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                },

                {
                    cityId: dubai._id,
                    name: "Burj Khalifa Visit",
                    type: "sightseeing",
                    cost: 120,
                    durationMins: 120,
                    description: "Visit the tallest building in the world.",
                    imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090"
                }

            );

        }


        // LONDON
        const london = cities.find(
            city => city.name === "London"
        );

        if (london) {

            activities.push(

                {
                    cityId: london._id,
                    name: "London Eye Ride",
                    type: "sightseeing",
                    cost: 70,
                    durationMins: 90,
                    description: "Amazing city skyline view.",
                    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"
                },

                {
                    cityId: london._id,
                    name: "Museum Tour",
                    type: "culture",
                    cost: 40,
                    durationMins: 180,
                    description: "Explore famous museums.",
                    imageUrl: "https://images.unsplash.com/photo-1529429611270-82a6d62f9d63"
                }

            );

        }


        // BALI
        const bali = cities.find(
            city => city.name === "Bali"
        );

        if (bali) {

            activities.push(

                {
                    cityId: bali._id,
                    name: "Temple Visit",
                    type: "culture",
                    cost: 35,
                    durationMins: 120,
                    description: "Explore ancient temples.",
                    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
                },

                {
                    cityId: bali._id,
                    name: "Beach Relaxation",
                    type: "sightseeing",
                    cost: 20,
                    durationMins: 240,
                    description: "Relax on tropical beaches.",
                    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                }

            );

        }


        // NEW YORK
        const newYork = cities.find(
            city => city.name === "New York"
        );

        if (newYork) {

            activities.push(

                {
                    cityId: newYork._id,
                    name: "Times Square Tour",
                    type: "sightseeing",
                    cost: 60,
                    durationMins: 120,
                    description: "Explore the heart of NYC.",
                    imageUrl: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2"
                },

                {
                    cityId: newYork._id,
                    name: "Broadway Show",
                    type: "culture",
                    cost: 200,
                    durationMins: 180,
                    description: "Watch famous Broadway performances.",
                    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35"
                }

            );

        }


        // ROME
        const rome = cities.find(
            city => city.name === "Rome"
        );

        if (rome) {

            activities.push(

                {
                    cityId: rome._id,
                    name: "Colosseum Tour",
                    type: "culture",
                    cost: 75,
                    durationMins: 150,
                    description: "Explore ancient Roman history.",
                    imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198"
                },

                {
                    cityId: rome._id,
                    name: "Italian Pizza Experience",
                    type: "food",
                    cost: 45,
                    durationMins: 90,
                    description: "Authentic Italian pizza tasting.",
                    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591"
                }

            );

        }


        // INSERT
        await ActivityCatalog.insertMany(
            activities
        );


        console.log(
            "Activity Catalog Seeded Successfully"
        );

        process.exit();

    }
    catch (err) {

        console.log(err);

        process.exit();

    }

}