const express = require("express");

const {
  getRewards,
  purchaseReward,
} = require("../controllers/reward.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getRewards);
router.post("/:id/purchase", purchaseReward);

module.exports = router;