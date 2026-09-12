const User = require("../models/user.model");
const { updateUserLevel } = require("./level.service");

const TASK_COMPLETION_XP = 10;

const awardTaskCompletionXP = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.xp += TASK_COMPLETION_XP;

  const previousLevel = user.level;

  await user.save();

  const levelResult = await updateUserLevel(user);

  return {
    xpAwarded: TASK_COMPLETION_XP,
    totalXP: user.xp,
    level: levelResult.level,
    leveledUp: levelResult.level > previousLevel,
  };
};

module.exports = {
  TASK_COMPLETION_XP,
  awardTaskCompletionXP,
};