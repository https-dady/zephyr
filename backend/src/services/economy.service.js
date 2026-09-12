const User = require("../models/user.model");

const TASK_COMPLETION_CURRENCY = 5;

const awardTaskCompletionCurrency = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.currency += TASK_COMPLETION_CURRENCY;

  await user.save();

  return {
    currencyAwarded: TASK_COMPLETION_CURRENCY,
    totalCurrency: user.currency,
  };
};

module.exports = {
  TASK_COMPLETION_CURRENCY,
  awardTaskCompletionCurrency,
};