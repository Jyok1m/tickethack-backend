var express = require("express");
var router = express.Router();
const Cart = require("../models/cart");
const Train = require("../models/trains");
const moment = require("moment");
const { checkBody } = require("../modules/checkBody");
const { toTitleCase } = require("../modules/toTitleCase");
const { fetchCityCode } = require("../modules/fetchCityCode");
const { fetchTrainList } = require("../modules/fetchTrainList");

router.post("/search", async (req, res) => {
  // Check if the fields have been filled:

  const { date } = req.body;
  const departure = toTitleCase(req.body.departure);
  const arrival = toTitleCase(req.body.arrival);

  if (!checkBody(req.body, ["departure", "arrival"])) {
    res.json({ result: false, error: "Please enter the city of departure and arrival !" });
    return;
  } else if (!checkBody(req.body, ["date"])) {
    res.json({ result: false, error: "Please select a date !" });
    return;
  }

  // Fetch the DEPARTURE and ARRIVAL city codes from the Gov API:

  const apiDeparture = await fetchCityCode(departure);
  const apiArrival = await fetchCityCode(arrival);

  res.json({ apiDeparture, apiArrival });
});

// Fetch the SNCF Data:

router.get("/", (req, res) => {
  fetch(
    "https://api.sncf.com/v1/coverage/sncf/journeys?from=admin:fr:75056&to=admin:fr:69123&datetime=20230129T150000",
    { headers: { Authorization: `Basic ${process.env.AUTH_KEY}` } }
  )
    .then((response) => response.json())
    .then((response) => res.json({ response }))
    .catch((err) => console.error(err));
});

// Route to GET all the trains available depending on users' inputs:

router.post("/", (req, res) => {
  const { date } = req.body;

  // Convertion des noms des villes en Title case pour matching:

  const departure = toTitleCase(req.body.departure);
  const arrival = toTitleCase(req.body.arrival);

  // Check pour determiner si les champs ont été bien remplis:

  if (!checkBody(req.body, ["departure", "arrival"])) {
    res.json({ result: false, error: "Please enter the city of departure and arrival !" });
    return;
  } else if (!checkBody(req.body, ["date"])) {
    res.json({ result: false, error: "Please select a date !" });
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
