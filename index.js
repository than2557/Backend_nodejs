const express = require("express");
const app = express();
const port = 5005;
const mongoose = require("mongoose");
const CustomersModel = require("./model/Customers.model");
const productModel = require("./model/product.model");
const order = require("./model/orders.model");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
// options can be passed, e.g. {allErrors: true}

app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    let data = req.body;
    console.log(data);
    data.customer_id = uuidv4();

    await mongoose.connect("mongodb://localhost:27017/ecom");

    let userdata = await CustomersModel.findOne({ username: data.username });
    if (userdata) {
      if (userdata.username === data.username) {
        res.status(400);
        return res.json({ message: "username is been used" });
      }
    }

    await CustomersModel.create(data);
    return res.json({ message: "register Success" });
  } catch (error) {
    return res.json(error.stack);
  }
});

app.post("/order", async (req, res) => {
  try {
    let body = req.body;

    body.Order_id = uuidv4();
    body.Order_date = new Date();
    body.statustOrder = "N";

    await mongoose.connect("mongodb://localhost:27017/ecom");
    await order.create(body);
    let listOrder = body.listOrder;
    listOrder.forEach(async (element) => {
      let product_id = element.product_id;
      let productData = await productModel.findOne({ product_id: product_id });
      let NewQty = productData.qty - element.qty;
      await productModel.updateOne(
        { product_id: product_id },
        { $set: { qty: NewQty } }
      );
    });
    return res.json(body);
  } catch (error) {
    return res.json(error);
  }
});

app.get("/getOrder", async (req, res) => {
  try {
    let orderId = req.body.Order_id;
    await mongoose.connect("mongodb://localhost:27017/ecom");
    let result = await order.findOne({ Order_id: orderId });
    return res.json(result);
  } catch (err) {
    return res.json(err);
  }
});

app.patch("/cancelOrder", async (req, res) => {
  try {
    let orderId = req.body.Order_id;
    await mongoose.connect("mongodb://localhost:27017/ecom");
    let result = await order.updateOne(
      { Order_id: orderId },
      { $set: { statustOrder: "F" } }
    );
    return res.json(result);
  } catch (error) {
    return res.json(error);
  }
});

app.post("/createProduct", async (req, res) => {
  try {
    let data = req.body;
    console.log(data);
    data.product_id = uuidv4();
    await mongoose.connect("mongodb://localhost:27017/ecom");
    await productModel.create(data);
    return res.json({ message: "create product Success" });
  } catch (error) {
    return res.json(error.stack);
  }
});

app.get("/getproduct", async (req, res) => {
  try {
    if (Object.keys(req.body).length > 0) {
      let data = req.body;
      console.log(data);

      await mongoose.connect("mongodb://localhost:27017/ecom");
      let result = await productModel.find(data);
      return res.json(result);
    } else {
      await mongoose.connect("mongodb://localhost:27017/ecom");
      let result = await productModel.find({});
      return res.json(result);
    }
  } catch (error) {
    return res.json(error.stack);
  }
});

app.get("/login", async (req, res) => {
  try {
    let data = req.body;
    const schema = {
      type: "object",
      properties: {
        username: { type: "string", minLength: 1 },
        password: { type: "string", minLength: 1 },
      },
      required: ["username", "password"],
    };
    const validate = ajv.compile(schema);
    const valid = validate(data);
    let valiableError = [];
    if (!valid) {
      validate.errors.forEach((element) => {
        switch (element.keyword) {
          case "required":
            valiableError.push(
              element.params.missingProperty.replace("/", ""),
              element.message
            );
            break;
          case "minLength":
            valiableError.push(
              element.instancePath.replace("/", ""),
              element.message
            );
            break;
          default:
            valiableError.push(element);
        }
      });
      return res.json({
        message: "cannot login",
        "error decsc": valiableError,
      });
    }
    // validate user mongo //
    let user = { username: req.body.username };
    await mongoose.connect("mongodb://localhost:27017/ecom");
    let result_find = await CustomersModel.findOne(user);
    if (result_find) {
      if (result_find.password !== req.body.password) {
        return res.json({
          message: "cannot login ",
          "error decse": "incorrect password",
        });
      }
      return res.json({ message: "req success" });
    } else {
      return res.json({
        message: "cannot login ",
        "error decse": "incorrect or missingparams",
      });
    }
  } catch (error) {
    return res.json(error.stack);
  }
});

app.get("/getprofile", async (req, res) => {
  let customer_id = { customer_id: req.body.customer_id };
  await mongoose.connect("mongodb://localhost:27017/ecom");
  let result_find = await CustomersModel.findOne(customer_id);
  let data = req.body;
  const schema = {
    type: "object",
    properties: {
      customer_id: { type: "string", minLength: 1 },
      name: { type: "string" },
      subname: { type: "string" },
      username: { type: "string" },
      password: { type: "string" },
    },
    required: ["customer_id"],
  };
  const validate = ajv.compile(schema);
  const valid = validate(data);
  let valiableError = [];
  if (!valid) {
    validate.errors.forEach((element) => {
      switch (element.keyword) {
        case "required":
          valiableError.push(
            element.params.missingProperty.replace("/", ""),
            element.message
          );
          break;
        case "minLength":
          valiableError.push(
            element.instancePath.replace("/", ""),
            element.message
          );
          break;
        default:
          valiableError.push(element);
      }
    });
    return res.json({
      message: "params incorrect or missing",
      "error decsc": valiableError,
    });
  }
  if (result_find) {
    return res.json({
      name: result_find.name,
      subname: result_find.subname,
      username: result_find.username,
    });
  } else {
    res.set(400);
    return res.json({ error: "data not found" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
