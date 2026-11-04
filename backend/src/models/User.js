const mongoose = require('mongoose');

const PasskeyDeviceSchema = new mongoose.Schema(
  {
    credentialID: {
      type: String,
      required: true,
      index: true,
    },
    credentialPublicKey: {
      type: String, // Base64URL string of the public key
      required: true,
    },
    counter: {
      type: Number,
      default: 0,
    },
    deviceType: {
      type: String,
      default: 'singleDevice',
    },
    backedUp: {
      type: Boolean,
      default: false,
    },
    transports: [
      {
        type: String,
      },
    ],
    deviceName: {
      type: String,
      default: 'Biometric Passkey',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['student', 'professional'],
      required: [true, 'Role is required (student or professional)'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    password: {
      type: String,
      select: false, // Hidden by default from queries for security
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'passkey'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },

    // --- FIDO2 / WEBAUTHN PASSKEYS ---
    hasPasskey: {
      type: Boolean,
      default: false,
    },
    passkeys: [PasskeyDeviceSchema],
    currentChallenge: {
      type: String,
      default: null, // Temporary cryptographic challenge for WebAuthn ceremony
    },

    // --- STUDENT FIELDS ---
    collegeName: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'student' && this.isProfileComplete;
      },
    },
    collegeEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null, // Optional institutional email
    },

    // --- PROFESSIONAL FIELDS ---
    companyName: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'professional' && this.isProfileComplete;
      },
    },
    designation: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'professional' && this.isProfileComplete;
      },
    },
    employeeEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: function () {
        return this.role === 'professional' && this.isProfileComplete;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to remove sensitive fields before returning user JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.currentChallenge;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
