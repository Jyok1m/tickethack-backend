const mongoose = require("mongoose");

const trainSchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  price: Number,
});

const Train = mongoose.model("trains", trainSchema);

module.exports = Train;
