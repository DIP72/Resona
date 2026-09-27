const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resona_db';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', alertRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

// Seed initial demonstration users into MongoDB if empty
async function seedDemoUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial emergency command personnel into MongoDB...');
      const demoAccounts = [
        {
          name: 'Commander Arjun Patel',
          email: 'commander@resona.gov.in',
          password: 'Password123!',
          role: 'Disaster Management Officer',
          organization: 'Odisha Disaster Rapid Action Force (ODRAF)',
          phone: '+91 94370 11223',
          location: 'Puri Command Center',
          badgeNumber: 'CMD-1011',
          status: 'ON_DUTY'
        },
        {
          name: 'Dr. Priya Sengupta',
          email: 'priya.imd@gov.in',
          password: 'Password123!',
          role: 'Meteorological Specialist',
          organization: 'India Meteorological Department (IMD)',
          phone: '+91 98300 44556',
          location: 'Bhubaneswar Weather Center',
          badgeNumber: 'MET-2022',
          status: 'ACTIVE'
        },
        {
          name: 'Ramesh Das',
          email: 'ramesh.volunteer@gmail.com',
          password: 'Password123!',
          role: 'Citizen / Volunteer',
          organization: 'Coastal Red Cross Volunteer',
          phone: '+91 70081 99887',
          location: 'Konark Coastal Ward 4',
          badgeNumber: 'CIT-3033',
          status: 'ACTIVE'
        }
      ];
      for (const acc of demoAccounts) {
        const u = new User(acc);
        await u.save();
      }
      console.log('Demo emergency personnel seeded into MongoDB users collection!');
    }
  } catch (err) {
    console.warn('User seeding note:', err.message);
  }
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(async () => {
  console.log(`>>> Connected to MongoDB database successfully at ${MONGODB_URI}`);
  await seedDemoUsers();
})
.catch((err) => {
  console.error('>>> MongoDB Connection Notice:', err.message);
  console.log('>>> Server will operate with in-memory resilient fallback cache.');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚨 LASTMILE ALERT SYSTEM BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📡 API Health:    http://localhost:${PORT}/api/health`);
  console.log(`📋 Presets:       http://localhost:${PORT}/api/presets`);
  console.log(`🔐 Auth Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔑 Auth Login:    http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Auth Users:    http://localhost:${PORT}/api/auth/users`);
  console.log(`💾 MongoDB URI:   ${MONGODB_URI}`);
  console.log(`====================================================`);
});
