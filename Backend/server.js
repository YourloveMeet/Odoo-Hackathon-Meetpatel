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
app.listen(5000, () => {
    console.log("Server Running");
});