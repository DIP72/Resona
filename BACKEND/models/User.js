const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a full name'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: [
      'Citizen',
      'Volunteer',
      'Emergency Responder',
      'Disaster Management Officer',
      'Meteorological Specialist',
      'Citizen / Volunteer',
      'Administrator'
    ],
    default: 'Citizen'
  },
  organization: {
    type: String,
    default: 'General Public',
    trim: true
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
    trim: true
  },
  location: {
    type: String,
    default: 'Bhubaneswar, Odisha',
    trim: true
  },
  badgeNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ON_DUTY', 'OFFLINE'],
    default: 'ACTIVE'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate badge number if not provided
UserSchema.pre('save', async function () {
  if (!this.badgeNumber) {
    const prefix = this.role === 'Volunteer' ? 'VOL' : (this.role === 'Citizen' ? 'CIT' : 'CMD');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    this.badgeNumber = `${prefix}-${randNum}`;
  }

  // Hash password if modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
