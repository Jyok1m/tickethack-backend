var express = require("express");
var router = express.Router();
require("../models/connection");
const Cart = require("../models/cart");
const Booking = require("../models/bookings");

// Route to get the list of all trains in the cart:

router.get("/", (req, res) => {
  Cart.find().then((cartData) => {
    if (cartData.length != 0) {
      res.json({ result: true, cartData });
    } else {
      res.json({ result: false });
    }
  });
});

// Route to delete a train in the cart:

router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  Cart.findByIdAndDelete(id).then(() => {
    res.json({ result: true });
  });
});

// Route to push from cart to bookings:

router.post("/purchase", (req, res) => {
  Cart.find().then((cartContent) => {
    for (const train of cartContent) {
      const { departure, arrival, date, price } = train;
      const newBooking = new Booking({ departure, arrival, date, price });
      newBooking.save().then(() => res.json({ result: true }));
    }
  });
  Cart.deleteMany().then(() => {
    return;
  });
});

module.exports = router;
