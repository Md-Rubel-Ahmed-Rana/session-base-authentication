require("dotenv").config()
const mongoose = require("mongoose");

mongoose.set('strictQuery', true)
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n72f5gi.mongodb.net/sessionDB`)
.then(() => {
    console.log("Database is connected");
})
.catch((err) => {
    console.log(err);
})