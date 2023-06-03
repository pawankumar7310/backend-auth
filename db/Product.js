const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pname: String,
  price: String,
  category: String,
  userName: String,
  userId: String,
  company: String,
});
module.exports = mongoose.model("products", productSchema);
