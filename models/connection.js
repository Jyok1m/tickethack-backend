const mongoose = require("mongoose");
const connectionString =
  "mongodb+srv://JoachimJasmin:ThisIsNotAPassword@cluster0.1zq3eft.mongodb.net/tickethack";

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Succesfully connected to the Tickethack Database"))
  .catch((errorType) => console.error(errorType));
