var express = require('express');
var router = express.Router();
require("../models/connection")
const Trains = require("../models/trains")
const fetch = require("node-fetch")

module.exports = router;