
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");


const { pool } = require("../config/db");
const transporter = require("../config/mailer");

const router = express.Router();


// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check existing user
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
      `,
      [cleanName, cleanEmail, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `
      SELECT id, name, email, password
      FROM users
      WHERE email = ?
      `,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
});


// =====================================================
// FORGOT PASSWORD
// =====================================================

// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      "SELECT id, name, email FROM users WHERE email = ?",
      [cleanEmail]
    );

    /*
      Same response for existing/non-existing email
      to prevent account enumeration.
    */

    if (users.length === 0) {
      return res.json({
        success: true,
        message:
          "If an account exists for this email, reset instructions have been sent.",
      });
    }

    const user = users[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Token valid for 30 minutes
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    // Save token in database
    await pool.execute(
      `
      INSERT INTO password_resets
      (user_id, token, expires_at)
      VALUES (?, ?, ?)
      `,
      [user.id, token, expiresAt]
    );

    // Reset page URL
    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Email
    const mailOptions = {
      from: `"SecureScan" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your SecureScan password",

      html: `
        <!DOCTYPE html>

        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reset Password</title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#020806;
          font-family:Arial, sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:40px auto;
            background:#07120e;
            border:1px solid #153b2b;
            border-radius:16px;
            padding:40px;
            color:#ffffff;
          ">

            <h1 style="
              margin:0 0 10px;
              color:#ffffff;
            ">
              Secure<span style="color:#20d86b;">Scan</span>
            </h1>

            <p style="
              color:#a9b8b2;
              font-size:16px;
            ">
              Hello ${user.name},
            </p>

            <h2 style="
              color:#ffffff;
              margin-top:30px;
            ">
              Reset your password
            </h2>

            <p style="
              color:#a9b8b2;
              line-height:1.6;
            ">
              We received a request to reset your SecureScan
              account password.
            </p>

            <p style="
              color:#a9b8b2;
              line-height:1.6;
            ">
              Click the button below to create a new password.
            </p>

            <div style="
              text-align:center;
              margin:35px 0;
            ">

              <a
                href="${resetLink}"
                style="
                  display:inline-block;
                  background:#20d86b;
                  color:#000000;
                  text-decoration:none;
                  padding:15px 28px;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Reset Password
              </a>

            </div>

            <p style="
              color:#7f9189;
              font-size:14px;
              line-height:1.6;
            ">
              This link will expire in 30 minutes.
            </p>

            <p style="
              color:#7f9189;
              font-size:14px;
              line-height:1.6;
            ">
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <hr style="
              border:none;
              border-top:1px solid #153b2b;
              margin:30px 0;
            ">

            <p style="
              color:#64756e;
              font-size:12px;
              text-align:center;
            ">
              © 2026 SecureScan. All rights reserved.
            </p>

          </div>

        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("Password reset email sent to:", user.email);

    return res.json({
      success: true,
      message:
        "If an account exists for this email, reset instructions have been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send password reset email",
    });
  }
});
// =====================================================
// RESET PASSWORD
// =====================================================

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Find valid reset token
    const [resetRows] = await pool.execute(
      `
      SELECT id, user_id
      FROM password_resets
      WHERE token = ?
        AND expires_at > NOW()
        AND used = FALSE
      LIMIT 1
      `,
      [token]
    );

    if (resetRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const reset = resetRows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    await pool.execute(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, reset.user_id]
    );

    // Mark token as used
    await pool.execute(
      `
      UPDATE password_resets
      SET used = TRUE
      WHERE id = ?
      `,
      [reset.id]
    );

    return res.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
});

module.exports = router;