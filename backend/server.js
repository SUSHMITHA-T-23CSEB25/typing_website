import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ================= Middleware ================= //

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT"],
        credentials: true,
    })
);

app.use(express.json());


// ================= MongoDB Connection ================= //

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));


// ================= User Schema ================= //

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


// ================= Routes ================= //


// Test Route
app.get("/", (req, res) => {
    res.send("Typing Backend API is running 🚀");
});


// Get all users
// Get users / Get user by email
app.get("/users", async (req, res) => {
    try {

        const { email } = req.query;


        if (email) {

            const user = await User.findOne({ email });


            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }


            return res.json(user);
        }


        const users = await User.find();

        res.json(users);


    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to fetch users",
        });

    }
});

// ================= Signup ================= //

app.post("/users", async (req, res) => {

    try {

        const { name, email, password } = req.body;


        const existingUser = await User.findOne({ email });


        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }


        const newUser = new User({
            name,
            email,
            password,
            scores: [],
        });


        await newUser.save();


        res.status(201).json(newUser);


    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Signup failed",
        });

    }

});



// ================= Login ================= //

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        const user = await User.findOne({
            email,
            password,
        });


        if (!user) {

            return res.status(400).json({
                message: "Invalid credentials",
            });

        }


        res.json(user);


    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Login failed",
        });

    }

});



// ================= Update User Name ================= //

app.put("/users/:id", async (req, res) => {

    try {


        const updatedUser = await User.findByIdAndUpdate(

            req.params.id,

            {
                name: req.body.name,
            },

            {
                new: true,
            }

        );


        res.json(updatedUser);


    } catch (err) {


        console.error(err);


        res.status(500).json({
            error: "Update failed",
        });


    }

});




// ================= Add Score ================= //

app.post("/users/:id/scores", async (req, res) => {


    try {


        const user = await User.findById(req.params.id);



        if (!user) {

            return res.status(404).json({
                message: "User not found",
            });

        }



        user.scores.push(req.body);



        // Keep only latest 10 scores

        if (user.scores.length > 10) {

            user.scores = user.scores.slice(-10);

        }



        await user.save();



        res.json(user);



    } catch (err) {


        console.error(err);


        res.status(500).json({
            error: "Saving score failed",
        });


    }


});




// ================= Start Server ================= //

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});