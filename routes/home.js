var express = require("express");
var router = express.Router();
require("../models/connection");
const Trains = require("../models/trains");
const fetch = require("node-fetch");

// Route to GET all the trains available depending on users' inputs:

router.get("/", (req, res) => {
  const { departure } = req.body;
  const { arrival } = req.body;

  Trains.find({ departure, arrival }).then((data) => {
    console.log(data)
    res.json({data})
  });
});

module.exports = router;
