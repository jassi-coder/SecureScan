import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";
import "../Auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL se token
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ================= RESET PASSWORD =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter"
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error(
        "Password must contain at least one number"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://securescan-production-a0c8.up.railway.app/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message || "Unable to reset password"
        );
        return;
      }

      toast.success("Password reset successfully");

      setSuccess(true);

    } catch (error) {
      console.error("Reset password error:", error);

      toast.error(
        "Unable to connect to the server"
      );

    } finally {
      setLoading(false);
    }
  };

  // ================= SUCCESS =================

  if (success) {
    return (
      <div className="auth-page">

        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>

        <div className="auth-container">

          <div className="auth-card">

            <div className="auth-success">

              <div className="auth-success-icon">
                <CheckCircle2 size={42} />
              </div>

              <h2>
                Password Reset Successfully
              </h2>

              <p>
                Your password has been updated successfully.
                You can now login with your new password.
              </p>

              <button
                className="auth-submit"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft size={18} />
                Go to Login
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ================= MAIN PAGE =================

  return (
    <div className="auth-page">

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <Link to="/login" className="auth-back">
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      <div className="auth-container">

        {/* LEFT SIDE */}

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
              Secure Password Recovery
            </div>

            <h1>
              Create your
              <span> new password.</span>
            </h1>

            <p>
              Choose a strong password to keep your
              SecureScan account protected.
            </p>

          </div>

        </div>

        {/* RIGHT CARD */}

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              <Lock size={22} />
            </div>

            <h2>
              Reset Password
            </h2>

            <p>
              Enter your new password below.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* PASSWORD */}

            <div className="auth-field">

              <label>
                New Password
              </label>

              <div className="auth-input-wrapper">

                <Lock size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-field">

              <label>
                Confirm Password
              </label>

              <div className="auth-input-wrapper">

                <Lock size={18} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Reset Password
                </>
              )}

            </button>

          </form>

          <div className="auth-security-note">

            <Lock size={14} />

            <span>
              Your information is protected.
            </span>

          </div>

        </div>

      </div>

      <div className="auth-footer">
        © 2026 SecureScan. All rights reserved.
      </div>

    </div>
  );
}

export default ResetPassword;