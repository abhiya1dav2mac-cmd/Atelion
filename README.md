# ⚡ ATELION - AI Collaborative Workspace
> **Dual-Role Enterprise Authentication System with Brevo Email OTP & Google OAuth 2.0**

---

## 🌟 Key Authentication & Registration Features

### 1. Interactive Profile Selector (Role-Based Onboarding)
Before registration, users are presented with a modern role selection screen:
- 🎓 **Student Mode**
- 💼 **Working Professional Mode**

---

### 2. Dual-Role Field Requirements

| Field | 🎓 Student Account | 💼 Working Professional Account |
| :--- | :--- | :--- |
| **Full Name** | Required | Required |
| **Email Address** | Required (Verified with OTP) | Required (Verified with OTP) |
| **Mobile Number** | Required | Required |
| **Password** | Required (Min. 6 chars) | Required (Min. 6 chars) |
| **College / University** | Required | *Not required* |
| **College Email ID** | Optional (Institutional ID) | *Not required* |
| **Company Name** | *Not required* | Required |
| **Designation / Job Title** | *Not required* | Required |
| **Employee / Work Email** | *Not required* | Required |

---

### 3. Verification & Security Engine
- **Brevo v3 Transactional Email Service:** Dispatches a 6-digit verification code with a high-deliverability responsive dark-mode HTML template.
- **10-Minute Expiry & Rate Limiting:** MongoDB TTL indexes auto-expire verification codes; locked after 5 failed attempts.
- **Google OAuth 2.0 Integration:**
  - If a user signs in with Google, Google provides their `name`, `email`, and `avatar`.
  - If it's a new account, Atelion seamlessly prompts them to pick their role and fill the remaining details (Mobile, College/Company, and optional password).
- **FIDO2 / WebAuthn Biometric Passkey:**
  - **Registration Prompt:** Right after OTP verification or Google account setup, user is asked: *"Do you want to enable Biometric Passkey (Windows Hello, Face ID, Touch ID) for 1-touch sign-in?"*
  - **1-Touch Passwordless Login:** Sign in instantly via platform biometrics or hardware security key without typing passwords.
  - **Security:** Public keys stored on MongoDB; private keys never leave user's hardware TPM/Secure Enclave.
- **Forgot Password Flow:**
  - User submits registered email.
  - 6-digit recovery passcode sent via Brevo.
  - User verifies OTP and enters a new password.

---

## 🛠️ Getting Started

### 1. Environment Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update your keys:

```env
PORT=5000
CLIENT_URL=http://localhost:5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# Brevo (Sendinblue) Email
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=your_verified_sender_email@domain.com
BREVO_FROM_NAME=Atelion Workspace

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Run the Application
From the `backend` folder:

```powershell
cd backend
npm install
npm start
```

Open your browser at:
```text
http://localhost:5000
```
*(The Express backend automatically serves the high-performance modern frontend from `frontend/index.html`!)*

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/register/initiate` | `POST` | Initiates registration & sends 6-digit OTP via Brevo |
| `/api/auth/register/verify-otp` | `POST` | Verifies OTP and creates verified user in MongoDB |
| `/api/auth/login` | `POST` | Email & Password login |
| `/api/auth/google` | `POST` | Google ID Token verification & 1-click login |
| `/api/auth/google/complete-profile` | `POST` | Completes missing student/professional fields for Google users |
| `/api/auth/passkey/register-options` | `POST` | Generates WebAuthn registration challenge & options |
| `/api/auth/passkey/verify-registration` | `POST` | Verifies biometric attestation & saves FIDO2 passkey |
| `/api/auth/passkey/login-options` | `POST` | Generates WebAuthn authentication challenge |
| `/api/auth/passkey/verify-login` | `POST` | Verifies biometric assertion and authenticates user |
| `/api/auth/forgot-password/send-otp` | `POST` | Sends password recovery passcode via Brevo |
| `/api/auth/forgot-password/verify-and-reset` | `POST` | Verifies recovery OTP and updates password |
| `/api/auth/me` | `GET` | Returns authenticated user profile |
| `/api/health` | `GET` | Health status of API and MongoDB connection |

