const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  
  // Requirement 2.3.2: Store profile picture (as Base64 or URL)
  avatar: { type: String, default: null },
  
  // Requirement 2.2.3: User bio
  bio: { type: String, default: '', maxLength: 500 },

  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  loginActivities: [
    {
      status: { type: String, enum: ['success', 'failed'], default: 'success' },
      deviceType: { type: String, default: 'Desktop' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);