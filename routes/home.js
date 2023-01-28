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

  const { date, time } = req.body;
  const departure = toTitleCase(req.body.departure);
  const arrival = toTitleCase(req.body.arrival);

  if (!checkBody(req.body, ["departure", "arrival"])) {
    res.json({ result: false, error: "Please enter the city of departure and arrival !" });
    return;
  } else if (!checkBody(req.body, ["date", "time"])) {
    res.json({ result: false, error: "Please select a date and time !" });
    return;
  }

  // Fetch the DEPARTURE and ARRIVAL city codes from the Gov API:
  const apiDeparture = await fetchCityCode(departure);
  const apiArrival = await fetchCityCode(arrival);

  // Fetch the SNCF Data from the API:
  const trainList = await fetchTrainList(apiDeparture, apiArrival, date, time);

  // Reception de la réponse:
  const { journeys } = await trainList;

  // Récupération des infos de base du prochain trajet A => B en fonction des paramètres utilisateurs de vitesse:
  const { itineraryType } = req.body; // "best", "rapid", "fastest"
  const train = await journeys.find(
    (train) => train.type === itineraryType || train.type === "best"
  );
  const { arrival_date_time, departure_date_time, duration } = await train;

  // Génération aléatoire des prix (entre 0€ et 200€):
  const fare = Math.floor(Math.random() * 200);

  // Récupération de la liste des arrêts majeurs entre A => B:
  const { sections } = await train;
  const stopList = await sections.filter(
    (section) => section.duration > 0 && section.from && section.from.name != section.to.name
  );
  const itinerary = [];
  for (let stop of stopList) {
    itinerary.push({
      from: stop.from.name,
      to: stop.to.name,
      section_departure_date_time: stop.departure_date_time,
      section_arrival_date_time: stop.arrival_date_time,
      section_duration: stop.duration,
    });
  }

  // TODO: Ajout de la boucle pour afficher les trains

  res.json({ result: true, arrival_date_time, departure_date_time, duration, fare, itinerary });
  // res.json({ result: true, journeys, stopList });
});

// Route to GET all the trains available depending on users' inputs:

router.post("/", (req, res) => {
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
