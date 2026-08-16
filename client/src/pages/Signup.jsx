import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";
import "../Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  const validatePassword = (password = "") => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    };
  };

  // =====================================================
  // SIGNUP
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------- NAME ----------------

    const name = formData.name.trim();

    if (!name) {
      toast.error("Please enter your name");
      return;
    }

    // ---------------- EMAIL ----------------

    const email = formData.email.trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // ---------------- PASSWORD ----------------

    const password = formData.password;

    if (!password) {
      toast.error("Please create a password");
      return;
    }

    const passwordRules = validatePassword(password);

    if (
      !passwordRules.length ||
      !passwordRules.uppercase ||
      !passwordRules.number
    ) {
      toast.error(
        "Password must contain 8 characters, one uppercase letter and one number"
      );
      return;
    }

    // ---------------- CONFIRM PASSWORD ----------------

    if (!formData.confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // ---------------- TERMS ----------------

    if (!formData.terms) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    // ---------------- LOADING ----------------

    setLoading(true);

    try {
      // =================================================
      // BACKEND API
      // =================================================

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // =================================================
      // ERROR RESPONSE
      // =================================================

      if (!response.ok) {
        toast.error(
          data.message || "Unable to create account"
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        data.message || "Account created successfully!"
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });

      // Go to login
      navigate("/login");

    } catch (error) {
      console.error("Signup error:", error);

      toast.error(
        "Unable to connect to server. Please make sure backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PASSWORD RULES FOR UI
  // =====================================================

  const passwordRules = validatePassword(
    formData?.password || ""
  );

  // =====================================================
  // UI
  // =====================================================

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


        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="auth-info">

          {/* LOGO */}

          <Link to="/" className="auth-logo">

            <div className="auth-logo-icon">
              <ShieldCheck size={25} />
            </div>

            <span>
              Secure<span>Scan</span>
            </span>

          </Link>


          {/* INFO CONTENT */}

          <div className="auth-info-content">

            {/* BADGE */}

            <div className="auth-badge">

              <span></span>

              Start Your Security Journey

            </div>


            {/* HEADING */}

            <h1>

              Create your

              <span>
                {" "}SecureScan account.
              </span>

            </h1>


            {/* DESCRIPTION */}

            <p>

              Create an account to save your website
              security scans, monitor reports and track
              security improvements.

            </p>


            {/* BENEFITS */}

            <div className="auth-benefits">


              {/* BENEFIT 1 */}

              <div className="auth-benefit">

                <div className="benefit-icon">

                  <CheckCircle2 size={19} />

                </div>

                <div>

                  <h3>
                    Save Security Scans
                  </h3>

                  <p>
                    Keep your website security reports
                    in one place.
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
                    Track Security
                  </h3>

                  <p>
                    Monitor your website security over time.
                  </p>

                </div>

              </div>


            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT CARD
        ================================================= */}

        <div className="auth-card signup-card">


          {/* CARD HEADER */}

          <div className="auth-card-header">

            <div className="auth-card-icon">

              <UserPlus size={22} />

            </div>

            <h2>
              Create account
            </h2>

            <p>
              Join SecureScan and start checking your websites.
            </p>

          </div>


          {/* =================================================
              SIGNUP FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>


            {/* ================= NAME ================= */}

            <div className="auth-field">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="auth-input-wrapper">

                <User size={18} />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />

              </div>

            </div>


            {/* ================= EMAIL ================= */}

            <div className="auth-field">

              <label htmlFor="signup-email">
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

              </div>

            </div>


            {/* ================= PASSWORD ================= */}

            <div className="auth-field">

              <label htmlFor="signup-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <Lock size={18} />

                <input
                  id="signup-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />


                {/* SHOW / HIDE */}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
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


              {/* ================= PASSWORD RULES ================= */}

              {formData.password && (

                <div className="password-rules">


                  {/* LENGTH */}

                  <div
                    className={
                      passwordRules.length
                        ? "rule-valid"
                        : ""
                    }
                  >

                    <CheckCircle2 size={14} />

                    8+ characters

                  </div>


                  {/* UPPERCASE */}

                  <div
                    className={
                      passwordRules.uppercase
                        ? "rule-valid"
                        : ""
                    }
                  >

                    <CheckCircle2 size={14} />

                    One uppercase letter

                  </div>


                  {/* NUMBER */}

                  <div
                    className={
                      passwordRules.number
                        ? "rule-valid"
                        : ""
                    }
                  >

                    <CheckCircle2 size={14} />

                    One number

                  </div>

                </div>

              )}

            </div>


            {/* ================= CONFIRM PASSWORD ================= */}

            <div className="auth-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="auth-input-wrapper">

                <Lock size={18} />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />


                {/* SHOW / HIDE */}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
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


            {/* ================= TERMS ================= */}

            <label className="terms-label">

              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />

              <span>

                I agree to the{" "}

                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Terms & Conditions coming soon"
                    )
                  }
                >
                  Terms & Conditions
                </button>

                {" "}and Privacy Policy.

              </span>

            </label>


            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (

                <>

                  <span className="auth-spinner"></span>

                  Creating account...

                </>

              ) : (

                <>

                  <UserPlus size={18} />

                  Create Account

                </>

              )}

            </button>

          </form>


          {/* ================= DIVIDER ================= */}

          <div className="auth-divider">

            <span>
              OR
            </span>

          </div>


          {/* ================= LOGIN ================= */}

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>


          {/* ================= SECURITY NOTE ================= */}

          <div className="auth-security-note">

            <Lock size={14} />

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

export default Signup;