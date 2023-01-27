const moment = require("moment");

const toJoinedIsoDateAndTime = (normalIsoDate, time) => {
  const joinedDate = moment(new Date()).format("YYYYMMDDT");
  const joinedTime = time.split(":").join("");
  joinedDateAndTime = joinedDate + joinedTime + "00";
  return joinedDateAndTime;
};

const toNormalIsoDate = (joinedIsoDate) => {
  const date = moment(joinedIsoDate).format();
  return date;
};

module.exports = { toJoinedIsoDateAndTime, toNormalIsoDate };
