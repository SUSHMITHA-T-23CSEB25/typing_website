import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

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

// =====================================================
// ENVIRONMENT VARIABLES CHECK
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing");
}

// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "typingDB",
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("✅ Database: typingDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    scores: [
      {
        wpm: {
          type: Number,
        },

        cpm: {
          type: Number,
        },

        accuracy: {
          type: Number,
        },

        mistakes: {
          type: Number,
        },

        time: {
          type: Number,
        },

        paragraphs: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Typing Backend API is running 🚀",
    database: "typingDB",
  });
});

// =====================================================
// GET USERS
// =====================================================

app.get("/users", async (req, res) => {
  try {
    const { email } = req.query;

    // -----------------------------------------------
    // Get one user by email
    // -----------------------------------------------

    if (email) {
      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json(user);
    }

    // -----------------------------------------------
    // Get all users
    // -----------------------------------------------

    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Get users error:", err);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// =====================================================
// SIGNUP
// =====================================================

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -----------------------------------------------
    // Validate input
    // -----------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // -----------------------------------------------
    // Check password length
    // -----------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    // -----------------------------------------------
    // Check existing user
    // -----------------------------------------------

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // -----------------------------------------------
    // Hash password
    // -----------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------------------------
    // Create user
    // -----------------------------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      scores: [],
    });

    console.log(`✅ New user created: ${user.email}`);

    // -----------------------------------------------
    // Send response
    // Never send password
    // -----------------------------------------------

    res.status(201).json({
      message: "User created successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);

    // Duplicate email protection
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Signup failed",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("================================");
    console.log("🔐 LOGIN REQUEST");
    console.log("Email:", email);
    console.log("================================");

    // -----------------------------------------------
    // Validate input
    // -----------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // -----------------------------------------------
    // Find user
    // -----------------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      console.log("❌ User not found:", cleanEmail);

      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    console.log("✅ User found:", user.email);

    // -----------------------------------------------
    // Check password
    // -----------------------------------------------

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      console.log("❌ Invalid password");

      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    console.log("✅ Password correct");

    // -----------------------------------------------
    // Check JWT secret
    // -----------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not configured");

      return res.status(500).json({
        message: "JWT_SECRET is not configured on the server",
      });
    }

    // -----------------------------------------------
    // Create JWT token
    // -----------------------------------------------

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log("✅ JWT token created");
    console.log("✅ Login successful:", user.email);

    // -----------------------------------------------
    // Send response
    // -----------------------------------------------

    res.status(200).json({
      token: token,

      name: user.name,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});

// =====================================================
// UPDATE USER
// =====================================================

app.put("/users/:id", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log(`✅ User updated: ${updatedUser.email}`);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Update user error:", err);

    res.status(500).json({
      message: "Update failed",
    });
  }
});

// =====================================================
// SAVE SCORE
// =====================================================

app.post("/users/:id/scores", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // -----------------------------------------------
    // Add new score
    // -----------------------------------------------

    user.scores.push({
      wpm: req.body.wpm,
      cpm: req.body.cpm,
      accuracy: req.body.accuracy,
      mistakes: req.body.mistakes,
      time: req.body.time,
      paragraphs: req.body.paragraphs,
    });

    // -----------------------------------------------
    // Keep only latest 10 scores
    // -----------------------------------------------

    if (user.scores.length > 10) {
      user.scores = user.scores.slice(-10);
    }

    await user.save();

    console.log(`✅ Score saved for: ${user.email}`);

    // -----------------------------------------------
    // Remove password before response
    // -----------------------------------------------

    const userResponse = user.toObject();

    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (err) {
    console.error("❌ Save score error:", err);

    res.status(500).json({
      message: "Failed to save score",
    });
  }
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("📦 Database: typingDB");
  console.log("🔐 JWT authentication enabled");
  console.log("================================");
});