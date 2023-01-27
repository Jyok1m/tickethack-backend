const { toJoinedIsoDateAndTime } = require("./convertDates");

const fetchTrainList = async (departureCityCode, arrivalCityCode, departureDate, departureTime) => {
  let response = await fetch(
    `https://api.sncf.com/v1/coverage/sncf/journeys?from=admin:fr:${departureCityCode}&to=admin:fr:${arrivalCityCode}&datetime=${toJoinedIsoDateAndTime(
      departureDate,
      departureTime
    )}`,
    { headers: { Authorization: `Basic ${process.env.AUTH_KEY}` } }
  );
  const requestResponse = await response.json();
  return requestResponse;
};

module.exports = { fetchTrainList };
