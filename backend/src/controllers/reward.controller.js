const mongoose = require("mongoose");

const Reward = require("../models/reward.model");
const User = require("../models/user.model");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward ID",
      });
    }

    const reward = await Reward.findOne({
      _id: id,
      isActive: true,
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    const purchasedAt = new Date();

    /*
     * Atomic purchase condition:
     *
     * 1. User must exist.
     * 2. User must have enough currency.
     * 3. Reward must not already exist in inventory.
     *
     * All three conditions are checked by MongoDB
     * as part of the same atomic update.
     */
    const updatedUser =
      await User.findOneAndUpdate(
        {
          _id: req.user.userId,

          currency: {
            $gte: reward.cost,
          },

          inventory: {
            $not: {
              $elemMatch: {
                reward: reward._id,
              },
            },
          },
        },
        {
          $inc: {
            currency: -reward.cost,
          },

          $push: {
            inventory: {
              reward: reward._id,
              purchasedAt,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedUser) {
      const userExists =
        await User.exists({
          _id: req.user.userId,
        });

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const alreadyPurchased =
        await User.exists({
          _id: req.user.userId,
          inventory: {
            $elemMatch: {
              reward: reward._id,
            },
          },
        });

      if (alreadyPurchased) {
        return res.status(409).json({
          success: false,
          message:
            "Reward already purchased",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          "Insufficient currency",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        reward,
        currency:
          updatedUser.currency,
        purchasedAt,
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