/**
 * Brevo (Sendinblue) Transactional Email Service
 * High-deliverability verification engine for Atelion AI Workspace
 */

function getBrevoConfig() {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const fromEmail = (process.env.BREVO_FROM_EMAIL || 'noreply@atelion.io').trim();
  const fromName = (process.env.BREVO_FROM_NAME || 'Atelion Workspace').trim();
  return { apiKey, fromEmail, fromName };
}

/**
 * Core Brevo API Dispatcher
 */
async function sendBrevoEmail({ toEmail, toName, subject, textContent, htmlContent }) {
  const { apiKey, fromEmail, fromName } = getBrevoConfig();

  if (!apiKey) {
    throw new Error('Brevo is not configured. Set BREVO_API_KEY in your .env file.');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: toEmail,
          name: toName || 'User',
        },
      ],
      subject,
      textContent,
      htmlContent,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Brevo API Error (${response.status}): ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return { success: true, raw: responseText };
  }
}

/**
 * Builds an Apple/Notion-grade sleek responsive HTML email template
 */
function buildEmailTemplate({ title, subtitle, name, roleBadge, otp, note }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; background: linear-gradient(145deg, #131B2E, #0F172A); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #6366F1, #38BDF8); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; text-align: center; font-size: 24px; font-weight: bold; color: #FFFFFF; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);">
                ⚡
              </div>
              <div style="font-size: 20px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.5px; margin-top: 10px;">
                ATELION
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: #94A3B8; letter-spacing: 2px;">
                AI Enterprise Workspace
              </div>
            </td>
          </tr>

          <!-- Role Badge -->
          ${
            roleBadge
              ? `<tr>
            <td align="center" style="padding-bottom: 16px;">
              <span style="display: inline-block; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #818CF8; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                ${roleBadge}
              </span>
            </td>
          </tr>`
              : ''
          }

          <!-- Headline -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                ${title}
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #94A3B8; line-height: 1.5;">
                ${subtitle}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-top: 16px; padding-bottom: 20px; font-size: 15px; color: #CBD5E1; line-height: 1.6;">
              Hello <strong style="color: #FFFFFF;">${name || 'Scholar'}</strong>,<br>
              ${note || 'Please use the verification passcode below to complete your action in Atelion.'}
            </td>
          </tr>

          <!-- Passcode Container -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <div style="background: rgba(15, 23, 42, 0.8); border: 2px dashed rgba(99, 102, 241, 0.5); border-radius: 12px; padding: 18px 24px; display: inline-block; letter-spacing: 8px; font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; color: #38BDF8; text-shadow: 0 0 16px rgba(56, 189, 248, 0.4);">
                ${otp}
              </div>
              <div style="font-size: 12px; color: #64748B; margin-top: 10px;">
                ⏱️ This passcode is valid for <strong>10 minutes</strong> only.
              </div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #64748B; line-height: 1.5;">
              🛡️ <strong>Security Tip:</strong> Never share this verification passcode with anyone. The Atelion Team will never ask you for your password or code. If you did not request this, please safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; font-size: 11px; color: #475569;">
              © ${new Date().getFullYear()} Atelion AI Workspace. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatches Registration OTP Email (Dynamic for Student vs Professional)
 */
async function sendRegistrationOtpEmail({ toEmail, name, otp, role }) {
  const isStudent = role === 'student';
  const roleBadge = isStudent ? '🎓 Student Account Verification' : '💼 Professional Account Verification';
  const title = isStudent ? 'Verify Your Student Account' : 'Verify Your Professional Account';
  const subtitle = isStudent
    ? 'Welcome to Atelion! Verify your academic email to unlock your AI study vault.'
    : 'Welcome to Atelion! Verify your corporate email to access your team workspace.';

  const htmlContent = buildEmailTemplate({
    title,
    subtitle,
    name,
    roleBadge,
    otp,
    note: `Thank you for signing up as a <strong>${
      isStudent ? 'Student' : 'Working Professional'
    }</strong>. Please enter the verification code below to complete your registration:`,
  });

  const textContent = `Atelion Verification Code: ${otp}\nValid for 10 minutes.\nDo not share this code with anyone.`;

  return sendBrevoEmail({
    toEmail,
    toName: name,
    subject: `🔐 Atelion Verification Code: ${otp}`,
    textContent,
    htmlContent,
  });
}

/**
 * Dispatches Forgot Password OTP Email
 */
async function sendForgotPasswordOtpEmail({ toEmail, name, otp }) {
  const htmlContent = buildEmailTemplate({
    title: 'Password Reset Request',
    subtitle: 'We received a request to reset your Atelion account password.',
    name,
    roleBadge: '🔑 Security Passcode',
    otp,
    note: 'Enter the verification passcode below to reset your password and secure your account:',
  });

  const textContent = `Atelion Password Reset Code: ${otp}\nValid for 10 minutes.\nIf you did not request a password reset, please secure your account immediately.`;

  return sendBrevoEmail({
    toEmail,
    toName: name,
    subject: `🔑 Atelion Password Reset Code: ${otp}`,
    textContent,
    htmlContent,
  });
}

module.exports = {
  sendRegistrationOtpEmail,
  sendForgotPasswordOtpEmail,
};

