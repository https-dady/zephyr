const User = require("../models/user.model");

const isSameCalendarDay = (
  date1,
  date2
) => {
  return (
    date1.getFullYear() ===
      date2.getFullYear() &&
    date1.getMonth() ===
      date2.getMonth() &&
    date1.getDate() ===
      date2.getDate()
  );
};

const isConsecutiveDay = (
  previousDate,
  currentDate
) => {
  const previous =
    new Date(previousDate);

  previous.setHours(
    0,
    0,
    0,
    0
  );

  const current =
    new Date(currentDate);

  current.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    current.getTime() -
    previous.getTime();

  const oneDay =
    24 * 60 * 60 * 1000;

  return difference === oneDay;
};

const updateUserStreak = async (
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

  const now = new Date();

  const lastCompletedAt =
    user.streak.lastCompletedAt;

  // First-ever task completion
  if (!lastCompletedAt) {
    user.streak.current = 1;
    user.streak.longest = 1;
    user.streak.lastCompletedAt =
      now;

    await user.save(
      session ? { session } : undefined
    );

    return {
      current:
        user.streak.current,

      longest:
        user.streak.longest,

      lastCompletedAt:
        user.streak.lastCompletedAt,
    };
  }

  // Another task completed on the same day
  if (
    isSameCalendarDay(
      lastCompletedAt,
      now
    )
  ) {
    return {
      current:
        user.streak.current,

      longest:
        user.streak.longest,

      lastCompletedAt:
        user.streak.lastCompletedAt,
    };
  }

  // Task completed on the next consecutive day
  if (
    isConsecutiveDay(
      lastCompletedAt,
      now
    )
  ) {
    user.streak.current += 1;

    if (
      user.streak.current >
      user.streak.longest
    ) {
      user.streak.longest =
        user.streak.current;
    }
  } else {
    // One or more days were missed
    user.streak.current = 1;
  }

  user.streak.lastCompletedAt =
    now;

  await user.save(
    session ? { session } : undefined
  );

  return {
    current:
      user.streak.current,

    longest:
      user.streak.longest,

    lastCompletedAt:
      user.streak.lastCompletedAt,
  };
};

module.exports = {
  updateUserStreak,
};