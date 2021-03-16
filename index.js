const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const db = require("./config/db");
const errorHandler = require("./middleware/error");
const fileupload = require("express-fileupload");

//import secure
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

//load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
db.connect();

//Routes files
const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const categoriesRoutes = require("./routes/categories");
const usersRoutes = require("./routes/users");
const reviewsRoutes = require("./routes/reviews");
const messagesRoutes = require("./routes/messages");

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//File uploading
app.use(fileupload());

//Santilize data
app.use(mongoSanitize());

//Set security
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  window: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

//Enable Cors
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount router
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/messages", messagesRoutes);

//Handle errors
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //close server $ exit process
  server.close(() => process.exit(1));
});
