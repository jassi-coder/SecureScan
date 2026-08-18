import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
  UserRound,
} from "lucide-react";

import { toast } from "sonner";
import "../Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!cleanEmail) {
      toast.error("Email address is required");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // =====================================================
    // START LOADING
    // =====================================================

    setLoading(true);

    try {
      // ===================================================
      // LOGIN API
      // ===================================================

      const response = await fetch(
        "https://securescan-production-a0c8.up.railway.app/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login API Response:", data);

      // ===================================================
      // BACKEND ERROR
      // ===================================================

      if (!response.ok || !data.success) {
        toast.error(
          data.message || "Invalid email or password"
        );

        return;
      }

      // ===================================================
      // CHECK USER DATA
      // ===================================================

      if (!data.user || !data.user.id) {
        console.error(
          "User data missing from login response:",
          data
        );

        toast.error(
          "Login successful, but user information was not received"
        );

        return;
      }

      // ===================================================
      // SAVE REAL DATABASE USER
      // ===================================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ===================================================
      // VERIFY LOCAL STORAGE
      // ===================================================

      const savedUser =
        localStorage.getItem("user");

      console.log(
        "Logged-in user saved:",
        savedUser
      );

      // ===================================================
      // SUCCESS
      // ===================================================

      toast.success(
        `Welcome back, ${data.user.name}!`
      );

      // ===================================================
      // GO HOME
      // ===================================================

      navigate("/");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      toast.error(
        "Unable to connect to SecureScan server. Please make sure backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="auth-page">

      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>


      {/* =================================================
          BACK HOME
      ================================================= */}

      <Link
        to="/"
        className="auth-back"
      >
        <ArrowRight
          size={18}
          style={{
            transform: "rotate(180deg)",
          }}
        />

        Back to Home
      </Link>


      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="auth-container">


        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="auth-info">

          {/* LOGO */}

          <Link
            to="/"
            className="auth-logo"
          >

            <div className="auth-logo-icon">
              <ShieldCheck size={25} />
            </div>

            <span>
              Secure<span>Scan</span>
            </span>

          </Link>


          {/* CONTENT */}

          <div className="auth-info-content">

            <div className="auth-badge">

              <span></span>

              Secure Website Assessment

            </div>


            <h1>

              Welcome back to

              <span>
                {" "}SecureScan.
              </span>

            </h1>


            <p>

              Sign in to your account to continue
              scanning websites and reviewing
              your security reports.

            </p>


            {/* BENEFITS */}

            <div className="auth-benefits">


              {/* BENEFIT 1 */}

              <div className="auth-benefit">

                <div className="benefit-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>

                  <h3>
                    Secure Scanning
                  </h3>

                  <p>
                    Analyze websites for common
                    security weaknesses.
                  </p>

                </div>

              </div>


              {/* BENEFIT 2 */}

              <div className="auth-benefit">

                <div className="benefit-icon">
                  <UserRound size={19} />
                </div>

                <div>

                  <h3>
                    Personal Scan History
                  </h3>

                  <p>
                    Keep your security scan results
                    connected to your account.
                  </p>

                </div>

              </div>


            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="auth-card">


          {/* HEADER */}

          <div className="auth-card-header">

            <div className="auth-card-icon">
              <LockKeyhole size={22} />
            </div>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to SecureScan.
            </p>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>


            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="login-email">
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}

                  onChange={(e) =>
                    setEmail(e.target.value)
                  }

                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <label htmlFor="login-password">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Forgot Password?
                </Link>

              </div>


              <div className="auth-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}

                  onChange={(e) =>
                    setPassword(e.target.value)
                  }

                  autoComplete="current-password"
                  disabled={loading}
                />


                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }

                  disabled={loading}

                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: "inherit",
                  }}

                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
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


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="auth-spinner"></span>

                  Signing in...
                </>

              ) : (

                <>
                  <LockKeyhole size={18} />

                  Sign In
                </>

              )}

            </button>

          </form>


          {/* =================================================
              SIGNUP
          ================================================= */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Create Account
            </Link>

          </div>


          {/* =================================================
              SECURITY NOTE
          ================================================= */}

          <div className="auth-security-note">

            <LockKeyhole size={14} />

            <span>
              Your login information is securely protected.
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="auth-footer">

        © 2026 SecureScan. All rights reserved.

      </div>

    </div>
  );
}

export default Login;