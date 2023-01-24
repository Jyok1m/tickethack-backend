const mongoose = require("mongoose");

const trainSchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  price: Number,
});

const Trains = mongoose.model("Trains", trainSchema);

module.exports = Trains;
