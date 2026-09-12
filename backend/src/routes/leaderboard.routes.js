const express = require("express");

const {
  getLeaderboard,
} = require("../controllers/leaderboard.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getLeaderboard);

module.exports = router;