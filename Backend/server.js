require("dotenv").config();
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log(err);
    });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/cities", require("./routes/cityRoutes"));
app.use("/api/stops", require("./routes/stopRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));

app.listen(5000, () => {
    console.log("Server Running");
});