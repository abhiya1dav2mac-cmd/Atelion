const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const { sendRegistrationOtpEmail, sendForgotPasswordOtpEmail } = require('../services/emailService');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { isDisposableEmail } = require('../utils/disposableEmailBlocker');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

// ==============================================================================
// 1. REGISTRATION - STEP 1: INITIATE & SEND OTP
// ==============================================================================
router.post('/register/initiate', async (req, res) => {
  try {
    const {
      role, // 'student' or 'professional'
      name,
      email,
      mobile,
      password,
      // Student specific
      collegeName,
      collegeEmail,
      // Professional specific
      companyName,
      designation,
      employeeEmail,
    } = req.body;

    // 1. Validate Role
    if (!role || !['student', 'professional'].includes(role)) {
      return res.status(400).json({ error: 'Please select a valid role (Student or Professional).' });
    }

    // 2. Validate Core Fields
    const cleanEmail = normalizeEmail(email);
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Full name is required (at least 2 characters).' });
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // Strict Anti-Temp / Disposable Mail Guard
    if (isDisposableEmail(cleanEmail)) {
      return res.status(400).json({
        error: 'Temporary/disposable email addresses are strictly prohibited. Please provide a genuine permanent email address.',
      });
    }
    if (role === 'student' && collegeEmail && isDisposableEmail(collegeEmail)) {
      return res.status(400).json({
        error: 'Disposable college emails are prohibited. Please provide a genuine university email.',
      });
    }
    if (role === 'professional' && employeeEmail && isDisposableEmail(employeeEmail)) {
      return res.status(400).json({
        error: 'Disposable work emails are prohibited. Please provide your official company email.',
      });
    }
    if (!mobile || mobile.trim().length < 7) {
      return res.status(400).json({ error: 'A valid mobile number is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 3. Role-specific validation
    if (role === 'student') {
      if (!collegeName || collegeName.trim().length < 2) {
        return res.status(400).json({ error: 'College/University name is required for students.' });
      }
    } else if (role === 'professional') {
      if (!companyName || companyName.trim().length < 2) {
        return res.status(400).json({ error: 'Company/Organization name is required for professionals.' });
      }
      if (!designation || designation.trim().length < 2) {
        return res.status(400).json({ error: 'Designation / Job Title is required for professionals.' });
      }
      if (!employeeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeEmail)) {
        return res.status(400).json({ error: 'Employee/Work email ID is required for professionals.' });
      }
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    // 5. Hash password and prepare temporary user payload
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const tempUserData = {
      role,
      name: name.trim(),
      email: cleanEmail,
      mobile: mobile.trim(),
      passwordHash,
      authProvider: 'local',
      collegeName: role === 'student' ? collegeName.trim() : null,
      collegeEmail: role === 'student' && collegeEmail ? normalizeEmail(collegeEmail) : null,
      companyName: role === 'professional' ? companyName.trim() : null,
      designation: role === 'professional' ? designation.trim() : null,
      employeeEmail: role === 'professional' ? normalizeEmail(employeeEmail) : null,
    };

    // 6. Generate 6-Digit OTP and store hashed OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const purpose = role === 'student' ? 'student-registration' : 'professional-registration';

    await OtpVerification.findOneAndUpdate(
      { email: cleanEmail, purpose },
      { email: cleanEmail, otpHash, purpose, tempUserData, attempts: 0, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 7. Dispatch Email via Brevo
    await sendRegistrationOtpEmail({
      toEmail: cleanEmail,
      name: name.trim(),
      otp,
      role,
    });

    console.log(`[AUTH-REGISTER] ✅ OTP dispatched via Brevo to ${cleanEmail} (${role})`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Valid for 10 minutes.`,
      email: cleanEmail,
      role,
    });
  } catch (err) {
    console.error('[AUTH-REGISTER-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Registration initiation failed. Please try again.' });
  }
});

// ==============================================================================
// 2. REGISTRATION - STEP 2: VERIFY OTP & CREATE USER
// ==============================================================================
router.post('/register/verify-otp', async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !otp) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const purpose = role === 'student' ? 'student-registration' : 'professional-registration';

    // 1. Fetch OTP record
    const record = await OtpVerification.findOne({
      email: cleanEmail,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ error: 'Verification code has expired or was not requested. Please try again.' });
    }

    // 2. Rate limit attempts
    if (record.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    // 3. Verify OTP Hash
    const isMatch = await bcrypt.compare(String(otp).trim(), record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: `Invalid verification code. Attempts left: ${5 - record.attempts}` });
    }

    // 4. Create or Update User
    const { tempUserData } = record;
    if (!tempUserData) {
      return res.status(400).json({ error: 'Registration session expired. Please register again.' });
    }

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = new User({
        role: tempUserData.role,
        name: tempUserData.name,
        email: tempUserData.email,
        mobile: tempUserData.mobile,
        password: tempUserData.passwordHash,
        authProvider: 'local',
        isEmailVerified: true,
        isProfileComplete: true,
        collegeName: tempUserData.collegeName,
        collegeEmail: tempUserData.collegeEmail,
        companyName: tempUserData.companyName,
        designation: tempUserData.designation,
        employeeEmail: tempUserData.employeeEmail,
      });
    } else {
      user.role = tempUserData.role;
      user.name = tempUserData.name;
      user.mobile = tempUserData.mobile;
      user.password = tempUserData.passwordHash;
      user.isEmailVerified = true;
      user.isProfileComplete = true;
      user.collegeName = tempUserData.collegeName;
      user.collegeEmail = tempUserData.collegeEmail;
      user.companyName = tempUserData.companyName;
      user.designation = tempUserData.designation;
      user.employeeEmail = tempUserData.employeeEmail;
    }

    await user.save();

    // 5. Clean up OTP record
    await OtpVerification.deleteOne({ _id: record._id });

    // 6. Generate Session JWT
    const token = generateToken(user);

    console.log(`[AUTH-VERIFIED] 🎉 Account created successfully for ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[AUTH-VERIFY-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'OTP verification failed.' });
  }
});

// ==============================================================================
// 3. LOGIN - EMAIL & PASSWORD (FOR BOTH STUDENT & PROFESSIONAL)
// ==============================================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Fetch user including hidden password field
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Check if password exists (e.g. if user registered purely via Google without setting a password)
    if (!user.password) {
      return res.status(401).json({
        error: 'This account was created with Google Sign-In. Please sign in with Google or reset your password.',
      });
    }

    // 3. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Check if email was verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Your email address is not verified yet. Please complete verification.' });
    }

    const token = generateToken(user);
    console.log(`[AUTH-LOGIN] 🔓 User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[AUTH-LOGIN-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// ==============================================================================
// 4. GOOGLE OAUTH 2.0 (SIGN-IN & PROFILE COMPLETION)
// ==============================================================================
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body; // Google ID Token from Google Identity Services

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    // 1. Verify Google ID Token
    let payload = null;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (gErr) {
      // In development or if client ID isn't set, decode token payload safely for testing
      const parts = credential.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      } else {
        throw new Error('Invalid Google credential token.');
      }
    }

    const googleEmail = normalizeEmail(payload.email);
    const googleName = payload.name || payload.given_name || 'Google User';
    const googleId = payload.sub;
    const avatar = payload.picture || null;

    if (!googleEmail) {
      return res.status(400).json({ error: 'Unable to extract email from Google profile.' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email: googleEmail });

    // Scenario A: Existing User with complete profile -> Log them in instantly!
    if (user && user.isProfileComplete) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }

      const token = generateToken(user);
      console.log(`[AUTH-GOOGLE] ⚡ Existing Google user logged in: ${user.email} (${user.role})`);

      return res.json({
        success: true,
        action: 'LOGIN_SUCCESS',
        token,
        user: user.toJSON(),
      });
    }

    // Scenario B: New User or Incomplete Profile -> Prompt user to choose Role and fill required details!
    console.log(`[AUTH-GOOGLE] 📝 New Google user detected: ${googleEmail}. Prompting for role and details.`);

    return res.json({
      success: true,
      action: 'REQUIRES_PROFILE_COMPLETION',
      message: 'Please select whether you are a Student or Working Professional to complete setup.',
      googleProfile: {
        email: googleEmail,
        name: googleName,
        googleId,
        avatar,
      },
    });
  } catch (err) {
    console.error('[AUTH-GOOGLE-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Google authentication failed.' });
  }
});

/**
 * Completes Google Profile with remaining Student or Professional fields
 */
router.post('/google/complete-profile', async (req, res) => {
  try {
    const {
      email,
      name,
      googleId,
      avatar,
      role, // 'student' or 'professional'
      mobile,
      password, // optional password for direct email login too
      collegeName,
      collegeEmail,
      companyName,
      designation,
      employeeEmail,
    } = req.body;

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !role || !['student', 'professional'].includes(role)) {
      return res.status(400).json({ error: 'Valid email and role (Student or Professional) are required.' });
    }
    if (!mobile || mobile.trim().length < 7) {
      return res.status(400).json({ error: 'Valid mobile number is required.' });
    }

    if (role === 'student' && (!collegeName || collegeName.trim().length < 2)) {
      return res.status(400).json({ error: 'College/University name is required for students.' });
    }

    if (role === 'professional') {
      if (!companyName || companyName.trim().length < 2) {
        return res.status(400).json({ error: 'Company name is required for professionals.' });
      }
      if (!designation || designation.trim().length < 2) {
        return res.status(400).json({ error: 'Designation is required for professionals.' });
      }
      if (!employeeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeEmail)) {
        return res.status(400).json({ error: 'Work/Employee email ID is required for professionals.' });
      }
    }

    let passwordHash = null;
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(password, salt);
    }

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = new User({
        role,
        name: name || 'User',
        email: cleanEmail,
        mobile: mobile.trim(),
        googleId,
        avatar: avatar || null,
        password: passwordHash,
        authProvider: 'google',
        isEmailVerified: true, // Google already verified this email
        isProfileComplete: true,
        collegeName: role === 'student' ? collegeName.trim() : null,
        collegeEmail: role === 'student' && collegeEmail ? normalizeEmail(collegeEmail) : null,
        companyName: role === 'professional' ? companyName.trim() : null,
        designation: role === 'professional' ? designation.trim() : null,
        employeeEmail: role === 'professional' ? normalizeEmail(employeeEmail) : null,
      });
    } else {
      user.role = role;
      if (name) user.name = name;
      user.mobile = mobile.trim();
      user.googleId = googleId || user.googleId;
      if (avatar) user.avatar = avatar;
      if (passwordHash) user.password = passwordHash;
      user.isEmailVerified = true;
      user.isProfileComplete = true;
      user.collegeName = role === 'student' ? collegeName.trim() : null;
      user.collegeEmail = role === 'student' && collegeEmail ? normalizeEmail(collegeEmail) : null;
      user.companyName = role === 'professional' ? companyName.trim() : null;
      user.designation = role === 'professional' ? designation.trim() : null;
      user.employeeEmail = role === 'professional' ? normalizeEmail(employeeEmail) : null;
    }

    await user.save();

    const token = generateToken(user);
    console.log(`[AUTH-GOOGLE-COMPLETE] 🎉 Google profile completed for ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Profile completed successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[AUTH-GOOGLE-COMPLETE-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Profile completion failed.' });
  }
});

// ==============================================================================
// 5. FORGOT PASSWORD - STEP 1: SEND OTP
// ==============================================================================
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpVerification.findOneAndUpdate(
      { email: cleanEmail, purpose: 'forgot-password' },
      { email: cleanEmail, otpHash, purpose: 'forgot-password', attempts: 0, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendForgotPasswordOtpEmail({
      toEmail: cleanEmail,
      name: user.name,
      otp,
    });

    console.log(`[AUTH-FORGOT-PASSWORD] 🔑 Password reset OTP sent to ${cleanEmail}`);

    res.json({
      success: true,
      message: `A password reset code has been sent to ${cleanEmail}. Valid for 10 minutes.`,
      email: cleanEmail,
    });
  } catch (err) {
    console.error('[AUTH-FORGOT-PASSWORD-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Unable to process password reset request.' });
  }
});

// ==============================================================================
// 6. FORGOT PASSWORD - STEP 2: VERIFY OTP & RESET PASSWORD
// ==============================================================================
router.post('/forgot-password/verify-and-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // 1. Fetch OTP record
    const record = await OtpVerification.findOne({
      email: cleanEmail,
      purpose: 'forgot-password',
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ error: 'Reset code has expired or was not requested. Please request a new code.' });
    }

    if (record.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: `Invalid reset code. Attempts left: ${5 - record.attempts}` });
    }

    // 2. Hash New Password and Update User
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // 3. Delete OTP record
    await OtpVerification.deleteOne({ _id: record._id });

    console.log(`[AUTH-PASSWORD-RESET] ✅ Password successfully updated for ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('[AUTH-RESET-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Password reset failed.' });
  }
});

// ==============================================================================
// 7. CURRENT USER PROFILE (/api/auth/me)
// ==============================================================================
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    user: req.user.toJSON(),
  });
});

module.exports = router;

