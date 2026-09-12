const CompletionLog = require("../models/completionLog.model");

const createCompletionLog = async ({
  userId,
  task,
  xpAwarded,
  currencyAwarded,
  attribute,
}) => {
  const completionLog =
    await CompletionLog.create({
      user: userId,

      task: task._id,

      title: task.title,

      category: task.category,

      completedAt:
        task.completedAt || new Date(),

      xpAwarded,

      currencyAwarded,

      attribute: {
        name:
          attribute?.attribute || null,

        amount:
          attribute?.amount || 0,
      },
    });

  return completionLog;
};

module.exports = {
  createCompletionLog,
};