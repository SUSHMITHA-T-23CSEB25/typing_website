import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
  .catch((err) => console.error("❌ MongoDB Error:", err));

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
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// ================= Test =================

app.get("/", (req, res) => {
  res.json({
    message: "Typing Backend API is running 🚀",
  });
});

// ================= Get Users =================

app.get("/users", async (req, res) => {
  try {
    const { email } = req.query;

    // Get one user by email
    if (email) {
      const user = await User.findOne({ email }).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json(user);
    }

    // Get all users
    const users = await User.find().select("-password");

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// ================= Signup =================

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      scores: [],
    });

    // Don't send password to frontend
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);

    res.status(500).json({
      error: "Signup failed",
    });
  }
});

// ================= Login =================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user using email only
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing");

      return res.status(500).json({
        message: "JWT_SECRET is not configured on the server",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log(`✅ Login successful for: ${user.email}`);

    // Send token and user information
    res.status(200).json({
      token: token,
      name: user.name,
    });
  } catch (err) {
    console.error("❌ Login error:", err);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ================= Update User =================

app.put("/users/:id", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update user error:", err);

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

    // Add score
    user.scores.push(req.body);

    // Keep only latest 10 scores
    if (user.scores.length > 10) {
      user.scores = user.scores.slice(-10);
    }

    await user.save();

    // Don't return password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error("Save score error:", err);

    res.status(500).json({
      error: "Failed to save score",
    });
  }
});

// ================= Start Server =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

