const express = require('express');
const router = express.Router();
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

function getRpID(req) {
  const host = req.hostname || 'localhost';
  // Strip port if present
  return host.split(':')[0];
}

function getOrigin(req) {
  const origin = req.get('origin');
  if (origin) return origin;
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  return `${protocol}://${host}`;
}

// In-memory challenge store for passwordless discoverable login
const challengeStore = new Map();

// ==============================================================================
// 1. REGISTER PASSKEY - STEP 1: GENERATE OPTIONS
// ==============================================================================
router.post('/register-options', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to initiate Passkey setup.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const rpID = getRpID(req);
    const rpName = 'Atelion AI Workspace';

    // Map existing passkeys to exclude them from re-registration
    const excludeCredentials = (user.passkeys || []).map((passkey) => ({
      id: passkey.credentialID,
      type: 'public-key',
      transports: passkey.transports || ['internal', 'hybrid'],
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user._id.toString()),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        // Omit authenticatorAttachment so both platform (TouchID/FaceID/Windows Hello) & USB keys work!
      },
    });

    // Save temporary challenge
    user.currentChallenge = options.challenge;
    await user.save();

    console.log(`[PASSKEY] 🔑 Generated registration options for ${user.email} (RP: ${rpID})`);
    res.json(options);
  } catch (err) {
    console.error('[PASSKEY-REG-OPTIONS-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate Passkey registration options.' });
  }
});

// ==============================================================================
// 2. REGISTER PASSKEY - STEP 2: VERIFY & SAVE PASSKEY
// ==============================================================================
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, response: registrationResponse, deviceName } = req.body;

    if (!email || !registrationResponse) {
      return res.status(400).json({ error: 'Email and registration response are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.currentChallenge) {
      return res.status(400).json({ error: 'Passkey registration session expired. Please try again.' });
    }

    const expectedRPID = getRpID(req);
    const expectedOrigin = getOrigin(req);

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: user.currentChallenge,
      expectedOrigin,
      expectedRPID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'FIDO2 Passkey verification failed.' });
    }

    const { credential } = verification.registrationInfo;

    // Convert binary credentialPublicKey to Base64URL string for storage
    const credentialPublicKeyBase64 = Buffer.from(credential.publicKey).toString('base64url');

    // Add new passkey device
    user.passkeys.push({
      credentialID: credential.id,
      credentialPublicKey: credentialPublicKeyBase64,
      counter: credential.counter,
      deviceType: credential.deviceType || 'singleDevice',
      backedUp: credential.backedUp || false,
      transports: registrationResponse.response?.transports || ['internal', 'hybrid'],
      deviceName: deviceName || 'Biometric Passkey (Windows Hello / Touch ID)',
      createdAt: new Date(),
    });

    user.hasPasskey = true;
    user.currentChallenge = null;
    await user.save();

    const token = generateToken(user);
    console.log(`[PASSKEY] ✅ Passkey registered successfully for ${user.email}! (Cred ID: ${credential.id.slice(0, 12)}...)`);

    res.json({
      success: true,
      message: 'FIDO2 Biometric Passkey setup successfully! You can now log in using Face ID, Touch ID, or Windows Hello.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[PASSKEY-VERIFY-REG-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to verify Passkey registration.' });
  }
});

// ==============================================================================
// 3. PASSKEY LOGIN - STEP 1: GENERATE AUTHENTICATION OPTIONS
// ==============================================================================
router.post('/login-options', async (req, res) => {
  try {
    const { email } = req.body;
    const rpID = getRpID(req);

    let allowCredentials = undefined;
    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user && user.passkeys && user.passkeys.length > 0) {
        allowCredentials = user.passkeys.map((pk) => ({
          id: pk.credentialID,
          type: 'public-key',
          transports: pk.transports || ['internal', 'hybrid'],
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials,
    });

    if (user) {
      user.currentChallenge = options.challenge;
      await user.save();
    } else {
      // Store in memory for 5 minutes
      challengeStore.set(options.challenge, { timestamp: Date.now() });
    }

    console.log(`[PASSKEY-LOGIN] 🔍 Login options generated (RP: ${rpID})`);
    res.json(options);
  } catch (err) {
    console.error('[PASSKEY-LOGIN-OPTIONS-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate Passkey login options.' });
  }
});

// ==============================================================================
// 4. PASSKEY LOGIN - STEP 2: VERIFY AUTHENTICATION & LOGIN
// ==============================================================================
router.post('/verify-login', async (req, res) => {
  try {
    const { email, response: authenticationResponse } = req.body;

    if (!authenticationResponse) {
      return res.status(400).json({ error: 'Authentication response is required.' });
    }

    const credentialID = authenticationResponse.id;
    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      // Discover user by credentialID
      user = await User.findOne({ 'passkeys.credentialID': credentialID });
    }

    if (!user) {
      return res.status(404).json({ error: 'No user account found with this biometric passkey.' });
    }

    const matchedPasskey = user.passkeys.find((pk) => pk.credentialID === credentialID);
    if (!matchedPasskey) {
      return res.status(400).json({ error: 'Passkey not recognized for this account.' });
    }

    const expectedRPID = getRpID(req);
    const expectedOrigin = getOrigin(req);
    const expectedChallenge = user.currentChallenge || authenticationResponse.clientDataJSON?.challenge;

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: user.currentChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: matchedPasskey.credentialID,
        publicKey: Buffer.from(matchedPasskey.credentialPublicKey, 'base64url'),
        counter: matchedPasskey.counter,
      },
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return res.status(401).json({ error: 'Biometric verification failed.' });
    }

    // Update counter to detect cloned authenticators
    matchedPasskey.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = null;
    await user.save();

    const token = generateToken(user);
    console.log(`[PASSKEY-LOGIN] 🔓 User logged in via Biometric Passkey: ${user.email}`);

    res.json({
      success: true,
      message: 'Signed in with Biometric Passkey successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[PASSKEY-VERIFY-LOGIN-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Passkey login verification failed.' });
  }
});

module.exports = router;

