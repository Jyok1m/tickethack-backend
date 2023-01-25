var express = require("express");
var router = express.Router();
require("../models/connection");
const fetch = require("node-fetch");
const Booking = require("../models/bookings");

router.get("/", (req, res) => {
  Booking.find().then((allBookings) => {
    if (allBookings.length != 0) {
      res.json({ result: true, allBookings });
    } else {
      res.json({ result: false });
    }
  });
});

module.exports = router;
