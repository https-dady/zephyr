const User = require("../models/user.model");

const ATTRIBUTE_REWARDS = {
  coding: {
    attribute: "intellect",
    amount: 1,
  },

  gym: {
    attribute: "strength",
    amount: 1,
  },

  fitness: {
    attribute: "vitality",
    amount: 1,
  },

  discipline: {
    attribute: "discipline",
    amount: 1,
  },

  learning: {
    attribute: "intellect",
    amount: 1,
  },

  planning: {
    attribute: "discipline",
    amount: 1,
  },
};

const updateUserAttribute = async (
  userId,
  category,
  session = null
) => {
  if (typeof category !== "string") {
    throw new Error(
      "Task category must be a valid string"
    );
  }

  const query = User.findById(userId);

  if (session) {
    query.session(session);
  }

  const user = await query;

  if (!user) {
    throw new Error("User not found");
  }

  const normalizedCategory =
    category.trim().toLowerCase();

  const reward =
    ATTRIBUTE_REWARDS[
      normalizedCategory
    ];

  if (!reward) {
    return {
      attribute: null,
      amount: 0,
      attributes:
        user.attributes,
    };
  }

  user.attributes[
    reward.attribute
  ] += reward.amount;

  await user.save(
    session ? { session } : undefined
  );

  return {
    attribute:
      reward.attribute,

    amount:
      reward.amount,

    attributes:
      user.attributes,
  };
};

module.exports = {
  ATTRIBUTE_REWARDS,
  updateUserAttribute,
};