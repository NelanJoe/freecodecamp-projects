require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const { Sequelize, Model, DataTypes } = require("sequelize");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite",
});

const Url = sequelize.define("url", {
  original_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  short_url: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  const urlString = req.body.url;

  if (!urlString) {
    return res.json({ error: "invalid url" });
  }

  const domainRegex = urlString.match(
    /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim
  );

  const param = domainRegex[0].replace(/^https?:\/\//i, "");

  console.log({ domainRegex, param });

  dns.lookup(param, async (err, address, family) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      const countUrls = await Url.count();

      const url = await Url.create({
        original_url: urlString,
        short_url: countUrls + 1,
      });

      return res.json({ original_url: urlString, short_url: url.short_url });
    }
  });
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const short_url = req.params.short_url;

  const url = await Url.findOne({ where: { short_url: short_url } });

  if (!url) {
    return res.json({ error: "invalid url" });
  }

  return res.redirect(url.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
