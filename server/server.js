const express = require("express");
const cors = require("cors");

const attemptsRoutes = require("./routes/attempts");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("SSC Quiz App Backend Running");
});

app.use("/api/attempts", attemptsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});