const Reward = require("../models/reward.model");
const User = require("../models/user.model");

const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: {
        rewards,
      },
    });
  } catch (error) {
    console.error(
      "Get rewards error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const purchaseReward = async (req, res) => {
  try {
    const reward = await Reward.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyPurchased =
      user.inventory.some(
        (item) =>
          item.reward.toString() ===
          reward._id.toString()
      );

    if (alreadyPurchased) {
      return res.status(409).json({
        success: false,
        message:
          "Reward already purchased",
      });
    }

    if (user.currency < reward.cost) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient currency",
      });
    }

    user.currency -= reward.cost;

    user.inventory.push({
      reward: reward._id,
      purchasedAt: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        reward,
        currency: user.currency,
        purchasedAt:
          user.inventory[
            user.inventory.length - 1
          ].purchasedAt,
      },
    });
  } catch (error) {
    console.error(
      "Purchase reward error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getRewards,
  purchaseReward,
};