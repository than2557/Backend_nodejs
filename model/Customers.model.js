const mongoose = require("mongoose");

const Customers = new mongoose.Schema({
  customer_id: { type: String },
  name: { type: String },
  subname: { type: String },
  username: { type: String },
  password: { type: String },
});
Customers.set("versionKey", false);
const collectionName = "Customers";
module.exports = mongoose.model(collectionName, Customers);
