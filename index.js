const express = require("express");
const app = express();
const port = 5005;
const mongoose = require("mongoose");
const CustomersModel = require("./model/Customers.model");

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
    await CustomersModel.create(data);
    return res.json({ message: "register Success" });
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
