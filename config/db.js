const mongoose = require("mongoose");
async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("Connect to database successfully");
  } catch (error) {
    console.log("Connect to database failed");
  }
}

module.exports = { connect };
