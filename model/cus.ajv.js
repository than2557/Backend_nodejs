const mongoose = require("mongoose");

const Customers = new mongoose.Schema({
  required: ["username", "password"],
  customer_id: { type: String },
  name: { type: String },
  subname: { type: String },
  username: { type: String },
  password: { type: String },
});
module.exports = Customers;
