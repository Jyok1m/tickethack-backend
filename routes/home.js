var express = require("express");
var router = express.Router();
const Cart = require("../models/cart");
const Train = require("../models/trains");
const moment = require("moment");
const { checkBody } = require("../modules/checkBody");
const { toTitleCase } = require("../modules/toTitleCase");
const { fetchCityCode } = require("../modules/fetchCityCode");
const { fetchTrainList } = require("../modules/fetchTrainList");
const { addOneToDepartureTime } = require("../modules/convertDatesAndTimes");

router.post("/search", async (req, res) => {
  // Check if the fields have been filled:
  if (!checkBody(req.body, ["departure", "arrival"])) {
    res.json({ result: false, error: "Please enter the city of departure and arrival !" });
    return;
  } else if (!checkBody(req.body, ["date", "time"])) {
    res.json({ result: false, error: "Please select a date and time !" });
    return;
  } else if (!checkBody(req.body, ["itineraryType"])) {
    res.json({ result: false, error: "Please select an itinerary type !" });
    return;
  }

  // Déclaration des variables:
  const allTrips = []; // Tableau dans lequel stocker chaque objet
  let counter = 1;
  let { time } = req.body;
  const departure = toTitleCase(req.body.departure); // Convert the city names to Title case
  const arrival = toTitleCase(req.body.arrival);
  const { itineraryType, date } = req.body; // "best", "rapid", "fastest"

  //Initialisation de la boucle:
  while (counter <= 10) {
    // Fetch the DEPARTURE and ARRIVAL city codes from the Gov API:
    const apiDeparture = await fetchCityCode(departure);
    const apiArrival = await fetchCityCode(arrival);

    // Fetch the SNCF Data from the API:
    const trainList = await fetchTrainList(apiDeparture, apiArrival, date, time);

    // Récupération des infos de base du prochain trajet A => B en fonction des paramètres utilisateurs de vitesse:
    const train = await trainList.find(
      (train) => train.type === itineraryType || train.type === "best"
    );
    const { departure_date_time, arrival_date_time, duration } = await train;
    const departureDate = moment(departure_date_time).format("YYYY-MM-DD");
    const departureTime = moment(departure_date_time).format("HH:mm");
    const arrivalDate = moment(arrival_date_time).format("YYYY-MM-DD");
    const arrivalTime = moment(arrival_date_time).format("HH:mm");
    const tripDuration = moment.utc(duration * 1000).format("HH:mm");

    // Génération aléatoire des prix (entre 0€ et 200€):
    const fare = Math.floor(Math.random() * 200);

    // Récupération de la liste des arrêts majeurs entre A => B:
    const { sections } = await train;
    const stopList = await sections.filter(
      (section) =>
        section.transfer_type != "walking" &&
        section.duration > 0 &&
        section.from &&
        section.from.name != section.to.name
    );

    // Établissement de l'itinéraire:
    const itinerary = [];
    for (let stop of stopList) {
      itinerary.push({
        from: stop.from.name,
        to: stop.to.name,
        sectionDepartureDate: moment(stop.departure_date_time).format("YYYY-MM-DD"),
        sectionDepartureTime: moment(stop.departure_date_time).format("HH:mm"),
        sectionArrivalDate: moment(stop.arrival_date_time).format("YYYY-MM-DD"),
        sectionArrivalTime: moment(stop.arrival_date_time).format("HH:mm"),
        sectionDuration: moment.utc(stop.duration * 1000).format("HH:mm"),
        trainType: stop.display_informations.commercial_mode,
        trainNumber: stop.display_informations.headsign,
        trainDirection: stop.display_informations.direction,
      });
    }

    //Push dans le tableau allTrips chaque voyage à la hauteur de 5x:
    allTrips.push({
      id: counter,
      departureStation: itinerary[0].from,
      arrivalStation: itinerary[itinerary.length - 1].to,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      tripDuration,
      correspondances: itinerary.length - 1,
      fare,
      itinerary,
    });

    // Incrémentation du temps et de la boucle:
    time = addOneToDepartureTime(departure_date_time);
    counter++;
  }
  res.json({ result: true, allTrips });
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
