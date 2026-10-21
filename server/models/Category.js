const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  alias: { type: String, required: true, unique: true, maxlength: 255 },
});

module.exports = mongoose.model("Category", categorySchema);