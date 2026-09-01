import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ================= Signup =================

router.post("/signup", async (req, res) => {
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
    await User.create({
      name,
      email,
      password: hashedPassword,
      scores: [],
    });

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);

    res.status(500).json({
      message: "Signup failed",
    });
  }
});

// ================= Login =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare password with hashed password
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
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log(`Login successful: ${user.email}`);

    // Return token + user information
    res.status(200).json({
      token,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});

export default router;
