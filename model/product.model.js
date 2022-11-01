const mongoose = require("mongoose");

const product = new mongoose.Schema({
  product_id: { type: String },
  product_name: { type: String },
  product_detail: { type: String },
  qty: { type: Number },
});
product.set("versionKey", false);

const collectionName = "product";
module.exports = mongoose.model(collectionName, product);
