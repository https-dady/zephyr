const User = require("../models/user.model");

const TASK_COMPLETION_CURRENCY = 5;

const awardTaskCompletionCurrency =
  async (
    userId,
    session = null
  ) => {
    const query =
      User.findById(userId);

    if (session) {
      query.session(session);
    }

    const user = await query;

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    user.currency +=
      TASK_COMPLETION_CURRENCY;

    await user.save(
      session
        ? { session }
        : undefined
    );

    return {
      currencyAwarded:
        TASK_COMPLETION_CURRENCY,

      totalCurrency:
        user.currency,
    };
  };

module.exports = {
  TASK_COMPLETION_CURRENCY,
  awardTaskCompletionCurrency,
};