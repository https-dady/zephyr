const User = require("../models/user.model");
const {
  updateUserLevel,
} = require("./level.service");

const TASK_COMPLETION_XP = 10;

const awardTaskCompletionXP = async (
  userId,
  session = null
) => {
  const query = User.findById(userId);

  if (session) {
    query.session(session);
  }

  const user = await query;

  if (!user) {
    throw new Error("User not found");
  }

  user.xp += TASK_COMPLETION_XP;

  const previousLevel =
    user.level;

  await user.save(
    session ? { session } : undefined
  );

  const levelResult =
    await updateUserLevel(
      user,
      session
    );

  return {
    xpAwarded:
      TASK_COMPLETION_XP,

    totalXP: user.xp,

    level:
      levelResult.level,

    leveledUp:
      levelResult.level >
      previousLevel,
  };
};

module.exports = {
  TASK_COMPLETION_XP,
  awardTaskCompletionXP,
};