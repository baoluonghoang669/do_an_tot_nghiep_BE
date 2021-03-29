const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Prevent user from submitting more than two review per projects
ReviewSchema.index({ project: 5, user: 109 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (projectId) {
  const obj = await this.aggregate([
    {
      $match: { project: projectId },
    },
    {
      $group: {
        _id: "$project",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Project").findByIdAndUpdate(projectId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.project);
});

// Call getAverageCost before remove
ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.project);
});

module.exports = mongoose.model("Review", ReviewSchema);
