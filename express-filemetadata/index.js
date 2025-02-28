const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "./public/data/uploads/" });

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  return res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
});

app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
