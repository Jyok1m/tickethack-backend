var express = require("express");
var router = express.Router();
require("../models/connection");
const Cart = require("../models/cart");
const Train = require("../models/trains");
const moment = require("moment");
const { checkBody } = require("../modules/checkBody");

// Route to GET all the trains available depending on users' inputs:

router.get("/", (req, res) => {
  const { departure } = req.body;
  const { arrival } = req.body;
  const inputDate = req.body.date;
  const date = moment(
    new Date(`${inputDate.slice(6)}-${inputDate.slice(3, 5)}-${inputDate.slice(0, 2)}`)
  ).format("YYYY-MM-DD");

  if (!checkBody(req.body, ["departure", "arrival"])) {
    res.json({ result: false, error: "Missing the city of departure or arrival" });
    return;
  }

  Train.findOne({ departure, arrival }).then((data) => {
    if (data === null) {
      res.json({ result: false, error: "Woops... No train has been found at this date !" });
    } else {
      Train.find({ departure, arrival }).then((data) => {
        const trainList = data.filter(
          (trainData) => moment(trainData.date).format("YYYY-MM-DD") === date
        );
        res.json({ result: true, trainList });
      });
    }
  });
});

// Route to POST the selected train to the User DB:

router.post("/book", (req, res) => {
  const { departure } = req.body;
  const { arrival } = req.body;
  const { date } = req.body;
  const { price } = req.body;

  const newTrainToCart = new Cart({ departure, arrival, date, price });

  newTrainToCart.save().then(() => res.json({ result: true }));
});

module.exports = router;
