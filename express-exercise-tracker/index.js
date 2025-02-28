const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { User, Exercise } = require("./models");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  try {
    const userName = req.body.username;

    if (!userName) {
      return res.status(400).json({ message: "username is required" });
    }

    const userExists = await User.findOne({ username: userName });

    if (userExists) {
      return res.status(400).json({ message: "username already exists" });
    } else {
      const user = await User.create({ username: userName });
      await user.save();

      return res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const userId = req.params._id;
    const description = req.body.description;
    const duration = req.body.duration;
    const date = req.body.date;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });

    await exercise.save();

    return res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toISOString().split("T")[0],
      _id: user._id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let query = { userId: user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let exercises = await Exercise.find(query).limit(Number(limit));

    return res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toISOString().split("T")[0],
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
