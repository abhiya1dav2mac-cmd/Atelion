const mongoose = require('mongoose');

const OtpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['student-registration', 'professional-registration', 'forgot-password'],
      required: true,
    },
    tempUserData: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // Holds registration draft details until email is verified
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL deletion
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup
OtpVerificationSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);

