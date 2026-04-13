const mongoose = require("mongoose");

const UniversityDataSchema = new mongoose.Schema({
  question: String,
  answer: String
});

module.exports = mongoose.model("UniversityData", UniversityDataSchema);