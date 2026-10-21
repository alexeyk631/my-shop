const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  message: { type: String, required: true, minlength: 10 },
  rating: { type: Number, min: 1, max: 5 },
  status: {
    type: String,
    enum: ["new", "in_progress", "resolved"],
    default: "new",
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);