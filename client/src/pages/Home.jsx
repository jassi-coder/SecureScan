import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Search,
  Lock,
  Globe,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  ScanSearch,
  Server,
  Cookie,
  ShieldAlert,
} from "lucide-react";

import { toast } from "sonner";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  // =====================================================
  // SCAN WEBSITE
  // =====================================================

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    let scanUrl = url.trim();

    // =====================================================
    // ADD HTTPS IF PROTOCOL IS MISSING
    // =====================================================

    if (
      !scanUrl.startsWith("http://") &&
      !scanUrl.startsWith("https://")
    ) {
      scanUrl = "https://" + scanUrl;
    }

    // =====================================================
    // VALIDATE URL
    // =====================================================

    try {
      const parsedUrl = new URL(scanUrl);

      if (!parsedUrl.hostname) {
        throw new Error("Invalid URL");
      }

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        throw new Error("Invalid protocol");
      }
    } catch {
      toast.error("Please enter a valid website URL");
      return;
    }

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    let user = null;

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      user = null;
    }

    console.log("Logged-in user:", user);

    // =====================================================
    // START SCAN
    // =====================================================

    setScanning(true);

    const loadingToast = toast.loading(
      "Scanning website security..."
    );

    try {
      const response = await fetch(
        "https://securescan-production-a0c8.up.railway.app/api/scan",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            url: scanUrl,

            // Send logged-in user's ID
            // If user is not logged in, send null
            userId: user?.id || null,
          }),
        }
      );

      const data = await response.json();

      toast.dismiss(loadingToast);

      // =====================================================
      // BACKEND ERROR
      // =====================================================

      if (!response.ok || !data.success) {
        toast.error(
          data.message || "Security scan failed"
        );

        return;
      }

      // =====================================================
      // SCAN SUCCESS
      // =====================================================

      console.log(
        "Security Scan Result:",
        data
      );

      console.log(
        "Saved Scan ID:",
        data.scan?.scanId
      );

      toast.success(
        `Scan completed! Security score: ${data.scan.score}/100`
      );

      // =====================================================
      // GO TO SCAN RESULT
      // =====================================================

      navigate("/scan-result", {
        state: {
          scan: data.scan,
        },
      });

    } catch (error) {
      console.error(
        "Scan error:",
        error
      );

      toast.dismiss(loadingToast);

      toast.error(
        "Unable to connect to SecureScan server"
      );

    } finally {
      setScanning(false);
    }
  };

  // =====================================================
  // MOBILE MENU
  // =====================================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =====================================================
  // EXAMPLE URL
  // =====================================================

  const useExampleUrl = () => {
    setUrl("https://example.com");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar">

        <div className="nav-container">

          {/* LOGO */}

          <a
            href="#home"
            className="logo"
            onClick={closeMenu}
          >

            <div className="logo-icon">
              <ShieldCheck size={23} />
            </div>

            <span>
              Secure<span>Scan</span>
            </span>

          </a>


          {/* =================================================
              NAV LINKS
          ================================================= */}

          <div
            className={`nav-links ${
              menuOpen ? "mobile-open" : ""
            }`}
          >

            <a
              href="#home"
              onClick={closeMenu}
            >
              Home
            </a>

            <a
              href="#how-it-works"
              onClick={closeMenu}
            >
              How It Works
            </a>

            <a
              href="#features"
              onClick={closeMenu}
            >
              Features
            </a>

            <a
              href="#security"
              onClick={closeMenu}
            >
              Security
            </a>


            {/* MOBILE AUTH */}

            <div className="mobile-auth">

              <Link
                to="/login"
                className="login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="signup-btn"
                onClick={closeMenu}
              >
                Sign Up
              </Link>

            </div>

          </div>


          {/* =================================================
              DESKTOP AUTH
          ================================================= */}

          <div className="nav-actions">

            <Link
              to="/login"
              className="login-btn"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="signup-btn"
            >
              Sign Up
            </Link>

          </div>


          {/* =================================================
              MOBILE MENU
          ================================================= */}

          <button
            className="menu-btn"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle navigation"
          >

            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}

          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="hero"
          id="home"
        >

          <div className="hero-glow glow-one"></div>

          <div className="hero-glow glow-two"></div>


          <div className="hero-content">

            {/* BADGE */}

            <div className="badge">

              <span className="badge-dot"></span>

              Website Security Scanner

            </div>


            {/* HEADING */}

            <h1>

              Scan Websites.

              <br />

              <span>
                Find Weaknesses.
              </span>

              <br />

              Stay Secure.

            </h1>


            {/* DESCRIPTION */}

            <p className="hero-description">

              Analyze your website for security
              misconfigurations, vulnerabilities and
              common security weaknesses with
              actionable recommendations.

            </p>


            {/* =================================================
                SCANNER
            ================================================= */}

            <div className="scanner-box">

              <div className="url-input-wrapper">

                <Globe size={20} />

                <input
                  type="text"
                  placeholder="Enter website URL (e.g. https://example.com)"
                  value={url}

                  onChange={(e) =>
                    setUrl(e.target.value)
                  }

                  onKeyDown={(e) => {

                    if (e.key === "Enter") {
                      handleScan();
                    }

                  }}

                  disabled={scanning}
                />

              </div>


              <button
                className="scan-btn"
                onClick={handleScan}
                disabled={scanning}
              >

                {scanning ? (

                  <>
                    <span className="auth-spinner"></span>

                    Scanning...

                  </>

                ) : (

                  <>
                    <Search size={19} />

                    Scan Website
                  </>

                )}

              </button>

            </div>


            {/* EXAMPLE */}

            <div className="example-url">

              Example:{" "}

              <span
                onClick={useExampleUrl}
                style={{
                  cursor: "pointer",
                }}
              >
                https://example.com
              </span>

            </div>


            {/* TRUST */}

            <div className="trust-line">

              <Lock size={14} />

              Safe & secure scanning

              <span>•</span>

              No passwords required

            </div>

          </div>

        </section>


        {/* =================================================
            QUICK FEATURES
        ================================================= */}

        <section className="feature-strip">

          <div className="feature-item">

            <div className="feature-icon">
              <ScanSearch size={22} />
            </div>

            <div>

              <h3>
                Comprehensive Scan
              </h3>

              <p>
                Check multiple security points
              </p>

            </div>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <ShieldCheck size={22} />
            </div>

            <div>

              <h3>
                Security Analysis
              </h3>

              <p>
                Identify common weaknesses
              </p>

            </div>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>

              <h3>
                Actionable Report
              </h3>

              <p>
                Know how to fix issues
              </p>

            </div>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <Lock size={22} />
            </div>

            <div>

              <h3>
                Secure Platform
              </h3>

              <p>
                Built with security in mind
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section
          className="section"
          id="how-it-works"
        >

          <div className="section-heading">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              Website security in three simple steps.
            </h2>

            <p>
              No complicated setup. Enter a URL,
              run the scanner and understand what
              needs to be improved.
            </p>

          </div>


          <div className="steps">

            {/* STEP 1 */}

            <div className="step-card">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                <Globe />
              </div>

              <h3>
                Enter Website
              </h3>

              <p>
                Enter the public URL of the website
                you want to assess.
              </p>

            </div>


            <div className="step-arrow">
              <ArrowRight />
            </div>


            {/* STEP 2 */}

            <div className="step-card">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                <ScanSearch />
              </div>

              <h3>
                Run Security Scan
              </h3>

              <p>
                Our scanner checks security headers,
                SSL/TLS, cookies and other
                configurations.
              </p>

            </div>


            <div className="step-arrow">
              <ArrowRight />
            </div>


            {/* STEP 3 */}

            <div className="step-card">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                <ShieldCheck />
              </div>

              <h3>
                Get Your Report
              </h3>

              <p>
                See security issues, severity levels
                and recommendations.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          className="detailed-features"
          id="features"
        >

          <div className="section-heading">

            <span>
              SECURITY FEATURES
            </span>

            <h2>
              Everything you need to understand
              your website's security.
            </h2>

            <p>
              SecureScan analyzes important security
              configurations and provides clear
              recommendations to help improve
              your website.
            </p>

          </div>


          <div className="feature-grid">

            {/* SECURITY HEADERS */}

            <div className="feature-card">

              <div className="large-feature-icon">
                <ShieldCheck />
              </div>

              <h3>
                Security Headers
              </h3>

              <p>
                Check important HTTP security headers
                such as CSP, HSTS, X-Frame-Options
                and X-Content-Type-Options.
              </p>

              <span>
                Header Analysis →
              </span>

            </div>


            {/* SSL */}

            <div className="feature-card">

              <div className="large-feature-icon">
                <Lock />
              </div>

              <h3>
                SSL / TLS Analysis
              </h3>

              <p>
                Check HTTPS availability, certificate
                information and basic transport-security
                configuration.
              </p>

              <span>
                SSL Analysis →
              </span>

            </div>


            {/* COOKIES */}

            <div className="feature-card">

              <div className="large-feature-icon">
                <Cookie />
              </div>

              <h3>
                Cookie Security
              </h3>

              <p>
                Analyze cookie security attributes
                such as Secure, HttpOnly and SameSite.
              </p>

              <span>
                Cookie Analysis →
              </span>

            </div>


            {/* CORS */}

            <div className="feature-card">

              <div className="large-feature-icon">
                <Globe />
              </div>

              <h3>
                CORS Analysis
              </h3>

              <p>
                Identify potentially risky
                Cross-Origin Resource Sharing
                configurations.
              </p>

              <span>
                CORS Analysis →
              </span>

            </div>


            {/* TECHNOLOGY */}

            <div className="feature-card">

              <div className="large-feature-icon">
                <Server />
              </div>

              <h3>
                Technology Detection
              </h3>

              <p>
                Identify publicly observable
                technologies and server information
                exposed by the website.
              </p>

              <span>
                Technology Scan →
              </span>

            </div>


            {/* RISK SCORE */}

            <div className="feature-card">

              <div className="large-feature-icon">
                <ShieldAlert />
              </div>

              <h3>
                Security Risk Score
              </h3>

              <p>
                Get an easy-to-understand security
                score with severity levels and
                recommendations.
              </p>

              <span>
                Risk Assessment →
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            SECURITY
        ================================================= */}

        <section
          className="security-section"
          id="security"
        >

          <div className="security-content">

            {/* TEXT */}

            <div className="security-text">

              <div className="small-label">
                BUILT WITH SECURITY FIRST
              </div>

              <h2>

                The scanner itself is

                <span>
                  {" "}security-focused.
                </span>

              </h2>

              <p>

                SecureScan will be designed to protect
                both users and the scanning infrastructure.
                We will implement URL validation,
                SSRF protection, rate limiting,
                request limits and secure authentication.

              </p>


              <div className="security-list">

                <div>
                  <CheckCircle2 />

                  <span>
                    SSRF protection
                  </span>

                </div>


                <div>
                  <CheckCircle2 />

                  <span>
                    Rate limiting
                  </span>

                </div>


                <div>
                  <CheckCircle2 />

                  <span>
                    Secure authentication
                  </span>

                </div>


                <div>
                  <CheckCircle2 />

                  <span>
                    Protected API endpoints
                  </span>

                </div>

              </div>

            </div>


            {/* TERMINAL */}

            <div className="security-card">

              <div className="security-card-header">

                <div className="terminal-dot"></div>

                <div className="terminal-dot"></div>

                <div className="terminal-dot"></div>

                <span>
                  securescan.security
                </span>

              </div>


              <div className="terminal-content">

                <p>

                  <span className="terminal-green">
                    $
                  </span>{" "}

                  security --status

                </p>


                <p className="terminal-success">
                  ✓ URL validation enabled
                </p>

                <p className="terminal-success">
                  ✓ SSRF protection enabled
                </p>

                <p className="terminal-success">
                  ✓ Rate limiter enabled
                </p>

                <p className="terminal-success">
                  ✓ Secure headers enabled
                </p>

                <p className="terminal-success">
                  ✓ Request timeout enabled
                </p>


                <p className="terminal-cursor">

                  <span className="terminal-green">
                    $
                  </span>{" "}

                  _

                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CTA
        ================================================= */}

        <section className="cta-section">

          <div className="cta-box">

            <div className="cta-icon">
              <ShieldCheck size={34} />
            </div>

            <h2>
              Ready to check your website?
            </h2>

            <p>
              Start with a security scan and discover
              what can be improved.
            </p>

            <button
              className="cta-button"
              onClick={() => {

                document
                  .getElementById("home")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

              }}
            >

              Start Free Scan

              <ChevronRight size={19} />

            </button>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <div className="footer-container">

          {/* BRAND */}

          <div className="footer-brand">

            <a
              href="#home"
              className="logo"
            >

              <div className="logo-icon">
                <ShieldCheck size={20} />
              </div>

              <span>
                Secure<span>Scan</span>
              </span>

            </a>


            <p>

              Website security assessment platform
              built with security-first principles.

            </p>

          </div>


          {/* FOOTER LINKS */}

          <div className="footer-links">

            {/* PRODUCT */}

            <div>

              <h4>
                Product
              </h4>

              <a href="#features">
                Features
              </a>

              <a href="#how-it-works">
                How It Works
              </a>

              <a href="#security">
                Security
              </a>

            </div>


            {/* ACCOUNT */}

            <div>

              <h4>
                Account
              </h4>

              <Link to="/login">
                Login
              </Link>

              <Link to="/signup">
                Sign Up
              </Link>

              <a
                href="#"
                onClick={(e) => {

                  e.preventDefault();

                  toast.info(
                    "Dashboard coming next"
                  );

                }}
              >
                Dashboard
              </a>

            </div>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">

          <span>
            © 2026 SecureScan.
            All rights reserved.
          </span>

          <span>
            Built for secure web assessment.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Home;