const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxLength: [50, "Name can not be more than 50 characters"],
    },
    image: {
      type: String,
      default: "no-photo.jpg",
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxLength: [1000, "Description can not be more than 1000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Cascade delete project when a category is deleted
CategorySchema.pre("remove", async function (next) {
  console.log(`Project being removed from category ${this._id}`);
  await this.model("Project").deleteMany({ categories: this._id });
  next();
});

//Reverse populate with virtuals;
CategorySchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "categories",
  justOne: false,
});

module.exports = mongoose.model("Category", CategorySchema);
