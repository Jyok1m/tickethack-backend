var express = require("express");
var router = express.Router();
const Cart = require("../models/cart");
const Train = require("../models/trains");
const moment = require("moment");
const { checkBody } = require("../modules/checkBody");

// Route to GET all the trains available depending on users' inputs:

router.post("/", (req, res) => {
  const { departure, arrival, date } = req.body;

  if (!checkBody(req.body, ["departure", "arrival"])) {
    res.json({ result: false, error: "Missing the city of departure or arrival" });
    return;
  } else if (!checkBody(req.body, ["date"])) {
    res.json({ result: false, error: "Missing the date" });
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

router.post("/book/:id", (req, res) => {
  const { id } = req.params;
  Train.findById(id).then((data) => {
    const { departure, arrival, date, price } = data;
    const newTrainToCart = new Cart({ departure, arrival, date, price });
    newTrainToCart.save().then(() => res.json({ result: true }));
  });
});
module.exports = router;
