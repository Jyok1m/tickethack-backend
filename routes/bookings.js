var express = require("express");
var router = express.Router();
require("../models/connection");
const fetch = require("node-fetch");
const Booking = require("../models/bookings");

router.get("/", (req, res) => {
  Booking.find().then((allBookings) => {
    res.json({ allBookings });
  });
});

module.exports = router;
