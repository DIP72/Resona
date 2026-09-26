const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'resona_lastmile_secret_key_2026_super_secure';

// In-memory fallback if MongoDB is temporarily inaccessible
let memoryUsers = new Map();

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper to sanitize user object for response (removes password)
function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization, phone, location } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists in MongoDB
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address is already registered.'
        });
      }

      // Create new user in MongoDB
      const newUser = new User({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: role || 'Emergency Responder',
        organization: organization || 'National Disaster Response Force (NDRF)',
        phone: phone || '+91 98765 43210',
        location: location || 'Puri, Odisha'
      });

      await newUser.save();
      const token = generateToken(newUser);
      const userResponse = sanitizeUser(newUser);

      return res.status(201).json({
        success: true,
        message: 'User successfully registered and saved to MongoDB!',
        storage: 'MONGODB_LOCAL',
        token,
        user: userResponse
      });
    }

    // Fallback in-memory registration if MongoDB is disconnected
    if (memoryUsers.has(cleanEmail)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fallbackUser = {
      _id: 'MEM-' + Date.now(),
      id: 'MEM-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'Emergency Responder',
      organization: organization || 'Disaster Response Command',
      phone: phone || '+91 98765 43210',
      location: location || 'Odisha Central',
      badgeNumber: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
      status: 'ACTIVE',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    memoryUsers.set(cleanEmail, fallbackUser);

    const token = generateToken(fallbackUser);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (In-Memory Resilient Cache)',
      storage: 'MEMORY_CACHE',
      token,
      user: sanitizeUser(fallbackUser)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check MongoDB
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.'
        });
      }

      // Update lastLogin
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);
      const userResponse = sanitizeUser(user);

      return res.json({
        success: true,
        message: 'Login successful! Verified against MongoDB.',
        storage: 'MONGODB_LOCAL',
        token,
        user: userResponse
      });
    }

    // In-Memory Fallback
    const memUser = memoryUsers.get(cleanEmail);
    if (!memUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, memUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    memUser.lastLogin = new Date();
    const token = generateToken(memUser);

    return res.json({
      success: true,
      message: 'Login successful (Memory Cache)',
      storage: 'MEMORY_CACHE',
      token,
      user: sanitizeUser(memUser)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during login.'
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization session.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id);
      if (user) {
        return res.json({
          success: true,
          user: sanitizeUser(user),
          storage: 'MONGODB_LOCAL'
        });
      }
    }

    // Memory fallback check
    for (const memUser of memoryUsers.values()) {
      if (memUser.id === decoded.id || memUser.email === decoded.email) {
        return res.json({
          success: true,
          user: sanitizeUser(memUser),
          storage: 'MEMORY_CACHE'
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'User profile not found.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auth/users (Showcase all registered MongoDB users)
router.get('/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: users.length,
        storage: 'MONGODB_LOCAL (mongodb://localhost:27017/resona_db)',
        users
      });
    }

    const list = Array.from(memoryUsers.values()).map(u => sanitizeUser(u));
    return res.json({
      success: true,
      count: list.length,
      storage: 'MEMORY_CACHE',
      users: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/seed-demo (Create demo accounts in MongoDB if empty)
router.post('/seed-demo', async (req, res) => {
  try {
    const demoAccounts = [
      {
        name: 'Commander Arjun Patel',
        email: 'commander@resona.gov.in',
        password: 'Password123!',
        role: 'Disaster Management Officer',
        organization: 'Odisha Disaster Rapid Action Force (ODRAF)',
        phone: '+91 94370 11223',
        location: 'Puri Command Center',
        badgeNumber: 'CMD-1011'
      },
      {
        name: 'Dr. Priya Sengupta',
        email: 'priya.imd@gov.in',
        password: 'Password123!',
        role: 'Meteorological Specialist',
        organization: 'India Meteorological Department (IMD)',
        phone: '+91 98300 44556',
        location: 'Bhubaneswar Weather Center',
        badgeNumber: 'MET-2022'
      },
      {
        name: 'Ramesh Das',
        email: 'ramesh.volunteer@gmail.com',
        password: 'Password123!',
        role: 'Citizen / Volunteer',
        organization: 'Coastal Red Cross Volunteer',
        phone: '+91 70081 99887',
        location: 'Konark Coastal Ward 4',
        badgeNumber: 'CIT-3033'
      }
    ];

    let createdCount = 0;
    if (mongoose.connection.readyState === 1) {
      for (const acc of demoAccounts) {
        const exists = await User.findOne({ email: acc.email });
        if (!exists) {
          const userDoc = new User(acc);
          await userDoc.save();
          createdCount++;
        }
      }
      return res.json({
        success: true,
        message: `Seeded ${createdCount} demonstration accounts in MongoDB!`,
        mongoUri: 'mongodb://localhost:27017/resona_db'
      });
    }

    return res.json({
      success: false,
      message: 'MongoDB is offline, skipping seeding.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
