const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userMessage: String,
    botReply: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);