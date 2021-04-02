const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxLength: [50, "Name can not be more than 50 characters"],
    },
    slug: String,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxLength: [1000, "Description can not be more than 1000 characters"],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    cost: {
      type: Number,
      required: [true, "Please add a cost"],
      min: [1, "Cost must be at least 1"],
    },
    address: {
      type: String,
      required: [true, "Please add a address"],
    },
    location: {
      //GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    architecture: {
      type: String,
      required: [true, "Please add a architecture"],
      trim: true,
      maxLength: [50, "Architecture can not be more than 50 characters"],
    },
    client: {
      type: String,
      required: [true, "Please add a client"],
      trim: true,
      maxLength: [50, "Client can not be more than 50 characters"],
    },
    completeDay: {
      type: Date,
      default: Date.now,
    },
    area: {
      type: Number,
      required: [true, "Please add a area"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    categories: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Create project slug from the name
ProjectSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

//Geocoder && create location field
ProjectSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);

  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].country,
  };

  //Do not save address in
  this.address = undefined;
  next();
});

//Cascade delete reviews when a project is deleted
ProjectSchema.pre("remove", async function (next) {
  console.log(`Reviews being removed from project ${this._id}`);
  await this.model("Review").deleteMany({ project: this._id });
  next();
});

//Reverse populate with virtuals
ProjectSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "project",
  justOne: false,
});

module.exports = mongoose.model("Project", ProjectSchema);
