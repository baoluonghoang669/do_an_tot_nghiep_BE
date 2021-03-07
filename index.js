const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const db = require("./config/db");
const errorHandler = require("./middleware/error");
const fileupload = require("express-fileupload");

//load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
db.connect();

//Routes files
const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const categoriesRoutes = require("./routes/categories");
const usersRoutes = require("./routes/users");

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

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount router
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/users", usersRoutes);

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
