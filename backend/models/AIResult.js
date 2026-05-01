const mongoose = require("mongoose");

const aiResultSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      default: "",
    },
    quiz: {
      type: String,
      default: "",
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIResult", aiResultSchema);
