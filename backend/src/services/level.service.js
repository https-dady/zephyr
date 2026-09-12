const getLevelFromXP = (xp) => {
  if (xp < 0) {
    return 1;
  }

  let level = 1;

  while (xp >= getXPRequiredForLevel(level + 1)) {
    level += 1;
  }

  return level;
};

const getXPRequiredForLevel = (level) => {
  if (level <= 1) {
    return 0;
  }

  return 50 * level * (level - 1);
};

const updateUserLevel = async (user) => {
  const newLevel = getLevelFromXP(user.xp);

  user.level = newLevel;

  await user.save();

  return {
    level: newLevel,
  };
};

module.exports = {
  getLevelFromXP,
  getXPRequiredForLevel,
  updateUserLevel,
};