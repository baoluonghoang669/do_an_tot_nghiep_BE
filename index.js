const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();

//load env vars
dotenv.config({ path: "./config/config.env" });

//Routes files
const authRoutes = require("./routes/auth");

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount router
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
