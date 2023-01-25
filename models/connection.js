const mongoose = require("mongoose");
const connectionString = process.env.DB_CONNECTION_STRING;

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Succesfully connected to the Tickethack Database"))
  .catch((errorType) => console.error(errorType));
