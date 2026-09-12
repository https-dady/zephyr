const User = require("../models/user.model");

const LEADERBOARD_METRICS = {
  xp: {
    label: "XP",
    sortField: "xp",
  },
  level: {
    label: "Level",
    sortField: "level",
  },
  currentStreak: {
    label: "Current Streak",
    sortField: "streak.current",
  },
  longestStreak: {
    label: "Longest Streak",
    sortField: "streak.longest",
  },
  strength: {
    label: "Strength",
    sortField: "attributes.strength",
  },
  intellect: {
    label: "Intellect",
    sortField: "attributes.intellect",
  },
  discipline: {
    label: "Discipline",
    sortField: "attributes.discipline",
  },
  vitality: {
    label: "Vitality",
    sortField: "attributes.vitality",
  },
};

const ALLOWED_LIMITS = [3, 10, 100];

const getLeaderboard = async (req, res) => {
  try {
    const metric = req.query.metric || "xp";
    const requestedLimit = Number(req.query.limit) || 10;

    if (!LEADERBOARD_METRICS[metric]) {
      return res.status(400).json({
        success: false,
        message: "Invalid leaderboard metric",
      });
    }

    if (!ALLOWED_LIMITS.includes(requestedLimit)) {
      return res.status(400).json({
        success: false,
        message:
          "Leaderboard limit must be 3, 10, or 100",
      });
    }

    const selectedMetric =
      LEADERBOARD_METRICS[metric];

    const users = await User.find({})
      .select(
        "name level xp streak.current streak.longest attributes createdAt"
      )
      .sort({
        [selectedMetric.sortField]: -1,
        xp: -1,
        level: -1,
        createdAt: 1,
      });

    const rankedUsers = users.map((user, index) => {
      let metricValue = 0;

      if (metric === "xp") {
        metricValue = user.xp;
      } else if (metric === "level") {
        metricValue = user.level;
      } else if (metric === "currentStreak") {
        metricValue = user.streak.current;
      } else if (metric === "longestStreak") {
        metricValue = user.streak.longest;
      } else if (metric === "strength") {
        metricValue = user.attributes.strength;
      } else if (metric === "intellect") {
        metricValue = user.attributes.intellect;
      } else if (metric === "discipline") {
        metricValue = user.attributes.discipline;
      } else if (metric === "vitality") {
        metricValue = user.attributes.vitality;
      }

      return {
        userId: user._id.toString(),
        rank: index + 1,
        name: user.name,
        level: user.level,
        xp: user.xp,
        currentStreak: user.streak.current,
        longestStreak: user.streak.longest,
        attributes: {
          strength: user.attributes.strength,
          intellect: user.attributes.intellect,
          discipline: user.attributes.discipline,
          vitality: user.attributes.vitality,
        },
        metricValue,
      };
    });

    const currentUser = rankedUsers.find(
      (player) =>
        player.userId === req.user.userId
    );

    const leaderboard = rankedUsers
      .slice(0, requestedLimit)
      .map(({ userId, ...player }) => player);

    return res.status(200).json({
      success: true,
      data: {
        metric,
        metricLabel: selectedMetric.label,
        limit: requestedLimit,
        leaderboard,
        currentUserRank:
          currentUser?.rank || null,
      },
    });
  } catch (error) {
    console.error(
      "Get leaderboard error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getLeaderboard,
};