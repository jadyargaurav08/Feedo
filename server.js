const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment variables.');
    process.exit(1);
}

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    });

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

const feedbackSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        feedback: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 }
    },
    { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const isValidEmail = (email) => /.+@.+\..+/.test(email);

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedName) {
        return res.status(400).json({ message: 'Please enter your name.', field: 'name' });
    }

    if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: 'Enter a valid email.', field: 'email' });
    }

    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.', field: 'password' });
    }

    try {
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.', field: 'email' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await User.create({
            name: normalizedName,
            email: normalizedEmail,
            passwordHash
        });

        return res.status(201).json({ message: 'Account created.' });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to create account right now.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: 'Enter a valid email.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const matched = await bcrypt.compare(password, user.passwordHash);

        if (!matched) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        return res.status(200).json({ message: 'Login successful.', name: user.name });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to login right now.' });
    }
});

app.post('/api/feedback', async (req, res) => {
    const { name, feedback, rating } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedFeedback = typeof feedback === 'string' ? feedback.trim() : '';
    const parsedRating = Number(rating);

    if (!normalizedName) {
        return res.status(400).json({ message: 'Please enter your name.', field: 'name' });
    }

    if (!normalizedFeedback) {
        return res.status(400).json({ message: 'Please enter feedback.', field: 'feedback' });
    }

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Please select a rating.', field: 'rating' });
    }

    try {
        await Feedback.create({ name: normalizedName, feedback: normalizedFeedback, rating: parsedRating });
        return res.status(201).json({ message: 'Feedback saved.' });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to save feedback right now.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
