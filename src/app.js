// src/app.js
const express = require("express");
const path = require("path");
const fileRoute = require("./routes/fileRoute");

const app = express();
const PORT = 3000;

// Set up Handlebars as the view engine (optional)
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Static file serving for fonts and other public assets
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes for generating files
app.use("/generate-file", fileRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
