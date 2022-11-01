const mongoose = require("mongoose");

const product = new mongoose.Schema({
  product_id: { type: String },
  subname: { type: String },
  username: { type: String },
  password: { type: String },
});

const collectionName = "product";
module.exports = mongoose.model(collectionName, product);
