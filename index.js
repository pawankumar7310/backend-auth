const express = require("express");
const cors = require("cors");
require("./db/config");
// const mongoose = require("mongoose");
const User = require("./db/User");
const Product = require("./db/product");
const Jwt = require("jsonwebtoken");
const jwtkey = "e-commerce";
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// sign up api
app.post("/register", async (req, resp) => {
  try {
    console.log("ref", req.body);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    console.log("user", user);

    // delete user.password;
    Jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        resp.send({ result: "auth is not found" });
      }
      resp.send({ user: user, auth: token });
    });
  } catch (error) {
    resp.status(500).send(error.message);
  }
});

// login api
app.post("/login", async (req, resp) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "auth is not found" });
        }
        resp.send({ user, auth: token });
      });
    } else {
      resp.status(500).send({ result: "user not found" });
    }
  } else {
    resp.status(500).send({ result: "user not found" });
  }
});

//add product

app.post("/add-product", verifyToken, async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

//show product All
app.get("/products", verifyToken, async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "product is not found" });
  }
});

// delete product list
app.delete("/product/:id", verifyToken, async (req, resp) => {
  let product = await Product.deleteOne({ _id: req.params.id });
  resp.send(product);
});

// get one product for updation
app.get("/product/:id", verifyToken, async (req, resp) => {
  let product = await Product.findOne({ _id: req.params.id });
  if (product) {
    resp.send(product);
  } else {
    resp.send({ result: "No Data Found" });
  }
});

// update product
app.put("/product/:id", verifyToken, async (req, resp) => {
  let product = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  resp.send(product);
});

// search product
app.get("/search/:key", verifyToken, async (req, resp) => {
  let result = await Product.find({
    $or: [
      {
        pname: { $regex: req.params.key },
      },
      {
        company: { $regex: req.params.key },
      },
      {
        price: { $regex: req.params.key },
      },
    ],
  });

  resp.send(result);
});

// jwt verification middleware
function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, jwtkey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: "please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "please add token with header" });
  }
  console.log("verify token called", token);
}

// server listen
app.listen(5001, () => {
  console.log("iam using---->  http://localhost:5001");
});
