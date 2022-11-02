const mongoose = require("mongoose");

const subSchemaOrder = new mongoose.Schema({
  product_id: { type: String },
  qty: { type: String },
  _id: false,
});
const Orders = new mongoose.Schema({
  Order_id: { type: String },
  customer_id: { type: String },
  listOrder: [subSchemaOrder],
  Order_date: { type: Date },
  statustOrder: { type: String },
});
Orders.set("versionKey", false);
const collectionName = "Orders";
module.exports = mongoose.model(collectionName, Orders);
