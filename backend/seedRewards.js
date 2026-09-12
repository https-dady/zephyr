require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./src/config/db");
const Reward = require("./src/models/reward.model");

const rewards = [
  {
    name: "Focus Theme",
    description: "A special theme for focused adventurers.",
    type: "theme",
    cost: 10,
    image: "",
    isActive: true,
  },
  {
    name: "First Quest",
    description: "A badge for completing your first quest.",
    type: "badge",
    cost: 10,
    image: "",
    isActive: true,
  },
  {
    name: "Streak Keeper",
    description: "A badge for maintaining your daily momentum.",
    type: "badge",
    cost: 15,
    image: "",
    isActive: true,
  },
  {
    name: "XP Booster",
    description: "A special item for dedicated adventurers.",
    type: "item",
    cost: 20,
    image: "",
    isActive: true,
  },
  {
    name: "Lucky Charm",
    description: "A rare item for a dedicated adventurer.",
    type: "item",
    cost: 25,
    image: "",
    isActive: true,
  },
];

const seedRewards = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    console.log("Checking rewards...");

    for (const reward of rewards) {
      const existingReward = await Reward.findOne({
        name: reward.name,
      });

      if (existingReward) {
        console.log(`Already exists: ${reward.name}`);
        continue;
      }

      await Reward.create(reward);

      console.log(`Created: ${reward.name}`);
    }

    console.log("Reward seeding completed successfully.");
  } catch (error) {
    console.error("Reward seeding error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedRewards();