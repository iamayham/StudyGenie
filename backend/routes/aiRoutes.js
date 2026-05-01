const express = require("express");
const { summary, quiz, explain, chat } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/summary", summary);
router.post("/quiz", quiz);
router.post("/explain", explain);
router.post("/chat", chat);

module.exports = router;
