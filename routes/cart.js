var express = require("express");
var router = express.Router();
require("../models/connection");
const Cart = require("../models/cart");
const Booking = require("../models/bookings");

// Route to get the list of all trains in the cart:

router.get("/", (req, res) => {
  Cart.find().then((cartData) => {
    res.json({ result: true, cartData });
  });
});

// Route to delete a train in the cart:

router.delete("/delete/:_id", (req, res) => {
  const idToDelete = req.params._id;
  console.log(idToDelete);
  Cart.findByIdAndDelete(idToDelete).then(() => {
    res.json({ result: true });
  });
});

// Route to push from cart to bookings:



module.exports = router;
