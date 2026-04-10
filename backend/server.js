const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const helmet   = require("helmet");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth",  require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
  app.use(cors({
  origin: "https://taskflow-mern-je1j-kappa.vercel.app",
  credentials: true
}));