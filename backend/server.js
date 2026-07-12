import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ================= Middleware =================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://typing-website-ia17.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ================= MongoDB =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

// ================= User Schema =================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    scores: [
      {
        wpm: Number,
        cpm: Number,
        accuracy: Number,
        mistakes: Number,
        time: Number,
        paragraphs: Number,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ================= Test =================

app.get("/", (req, res) => {
  res.send("Typing Backend API is running 🚀");
});

// ================= Get Users =================

app.get("/users", async (req, res) => {
  try {
    const { email } = req.query;

    if (email) {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json(user);
    }

    const users = await User.find();

    res.json(users);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// ================= Signup =================

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      scores: [],
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({
      error: "Signup failed",
    });
  }
});

// ================= Login =================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      password,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      error: "Login failed",
    });
  }
});

// ================= Update User =================

app.put("/users/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      {
        new: true,
      }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      error: "Update failed",
    });
  }
});

// ================= Save Score =================

app.post("/users/:id/scores", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.scores.push(req.body);

    if (user.scores.length > 10) {
      user.scores = user.scores.slice(-10);
    }

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({
      error: "Failed to save score",
    });
  }
});

// ================= Start =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});