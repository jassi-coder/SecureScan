import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";
import "../Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const cleanEmail = email.trim().toLowerCase();

  // ================= EMAIL REQUIRED =================

  if (!cleanEmail) {
    toast.error("Email address is required");
    return;
  }

  // ================= EMAIL VALIDATION =================

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    toast.error("Please enter a valid email address");
    return;
  }

  // ================= LOADING =================

  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/forgot-password",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: cleanEmail,
        }),
      }
    );

    const data = await response.json();

    // ================= BACKEND ERROR =================

    if (!response.ok) {
      toast.error(
        data.message || "Unable to process request"
      );
      return;
    }

    // ================= SUCCESS =================

    setSent(true);

    toast.success(
      data.message || "Password reset link sent"
    );

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );

    toast.error(
      "Unable to connect to server. Please make sure backend is running."
    );

  } finally {

    setLoading(false);

  }
};

  return (
    <div className="auth-page">

      {/* ================= BACKGROUND GLOW ================= */}

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      {/* ================= BACK HOME ================= */}

      <Link to="/" className="auth-back">
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div className="auth-container">

        {/* ================= LEFT SIDE ================= */}

        <div className="auth-info">

          <Link to="/" className="auth-logo">

            <div className="auth-logo-icon">
              <ShieldCheck size={25} />
            </div>

            <span>
              Secure<span>Scan</span>
            </span>

          </Link>

          <div className="auth-info-content">

            <div className="auth-badge">
              <span></span>
              Secure Account Recovery
            </div>

            <h1>
              Reset your
              <span> SecureScan password.</span>
            </h1>

            <p>
              Enter the email address associated with
              your SecureScan account and we'll help you
              get back into your account.
            </p>

            <div className="auth-benefits">

              {/* BENEFIT 1 */}

              <div className="auth-benefit">

                <div className="benefit-icon">
                  <LockKeyhole size={19} />
                </div>

                <div>

                  <h3>
                    Secure Recovery
                  </h3>

                  <p>
                    Password reset links will be securely
                    delivered to your email.
                  </p>

                </div>

              </div>

              {/* BENEFIT 2 */}

              <div className="auth-benefit">

                <div className="benefit-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>

                  <h3>
                    Protected Account
                  </h3>

                  <p>
                    Your account security remains our priority.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="auth-card">

          {!sent ? (

            <>
              {/* ================= HEADER ================= */}

              <div className="auth-card-header">

                <div className="auth-card-icon">
                  <LockKeyhole size={22} />
                </div>

                <h2>
                  Forgot password?
                </h2>

                <p>
                  Enter your email to receive a password
                  reset link.
                </p>

              </div>

              {/* ================= FORM ================= */}

              <form onSubmit={handleSubmit}>

                <div className="auth-field">

                  <label htmlFor="forgot-email">
                    Email Address
                  </label>

                  <div className="auth-input-wrapper">

                    <Mail size={18} />

                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      autoComplete="email"
                    />

                  </div>

                </div>

                {/* ================= SUBMIT ================= */}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <span className="auth-spinner"></span>
                      Sending reset link...
                    </>

                  ) : (

                    <>
                      <Mail size={18} />
                      Send Reset Link
                    </>

                  )}

                </button>

              </form>

              {/* ================= BACK LOGIN ================= */}

              <div className="auth-switch">

                <span>
                  Remember your password?
                </span>

                <Link to="/login">
                  Back to Login
                </Link>

              </div>

            </>

          ) : (

            /* ================= SUCCESS ================= */

            <div className="auth-success">

              <div className="auth-success-icon">
                <CheckCircle2 size={42} />
              </div>

              <h2>
                Check your email
              </h2>

              <p>
                If an account exists for
                <strong> {email}</strong>,
                we've sent instructions to reset your
                password.
              </p>

              <p className="auth-success-small">
                Didn't receive the email? Check your
                spam folder or try again.
              </p>

              <Link
                to="/login"
                className="auth-submit auth-submit-link"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>

            </div>

          )}

          {/* ================= SECURITY NOTE ================= */}

          <div className="auth-security-note">

            <LockKeyhole size={14} />

            <span>
              Your information is protected.
            </span>

          </div>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="auth-footer">
        © 2026 SecureScan. All rights reserved.
      </div>

    </div>
  );
}

export default ForgotPassword;