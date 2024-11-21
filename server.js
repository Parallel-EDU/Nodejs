const express = require("express");
const User = require("./models/hashedPassword");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

mongoose
  .connect(process.env.URI)
  .then(() => console.log("Connected to the Database"))
  .catch((err) => console.log(err));

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = User({ username, password });
    await user.save();
    res.status(201).send("User Registered Successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).send("Logged in Successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
