import { useLocation, useNavigate } from "react-router-dom";
import "./ScanResult.css";
import {
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  Cookie,
  Server,
} from "lucide-react";


function ScanResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const scan = location.state?.scan;

  // Prevent black screen if result is missing
  if (!scan) {
    return (
      <div className="result-page">
        <div className="result-empty">
          <ShieldCheck size={55} />

          <h1>No Scan Result Found</h1>

          <p>
            Please run a website security scan first.
          </p>

          <button
            className="result-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            Back to Scanner
          </button>
        </div>
      </div>
    );
  }

  const {
    url,
    statusCode,
    responseTime,
    score = 0,
    summary = {},
    securityHeaders = {},
    cookies = [],
    issues = [],
  } = scan;

  const high = summary.high || 0;
  const medium = summary.medium || 0;
  const low = summary.low || 0;
  const totalIssues = summary.totalIssues || 0;

  const getScoreStatus = () => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Improvement";
    return "Poor";
  };

  const getScoreClass = () => {
    if (score >= 80) return "score-good";
    if (score >= 60) return "score-medium";
    return "score-poor";
  };

  const getSeverityClass = (severity) => {
    if (severity === "High") return "severity-high";
    if (severity === "Medium") return "severity-medium";
    return "severity-low";
  };

  const headerItems = [
    {
      name: "Content-Security-Policy",
      key: "content-security-policy",
    },
    {
      name: "Strict-Transport-Security",
      key: "strict-transport-security",
    },
    {
      name: "X-Frame-Options",
      key: "x-frame-options",
    },
    {
      name: "X-Content-Type-Options",
      key: "x-content-type-options",
    },
    {
      name: "Referrer-Policy",
      key: "referrer-policy",
    },
    {
      name: "Permissions-Policy",
      key: "permissions-policy",
    },
  ];

  return (
    <div className="result-page">

      {/* ================= NAVBAR ================= */}

      <nav className="result-navbar">

        <div className="result-logo">
          <div className="result-logo-icon">
            <ShieldCheck size={23} />
          </div>

          <span>
            Secure<span>Scan</span>
          </span>
        </div>

        <button
          className="result-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          New Scan
        </button>

      </nav>

      {/* ================= CONTENT ================= */}

      <main className="result-container">

        {/* HEADER */}

        <div className="result-header">

          <div>
            <div className="result-label">
              SECURITY SCAN RESULT
            </div>

            <h1>
              Website Security Report
            </h1>

            <div className="scanned-url">
              <Globe size={16} />
              {url}
            </div>
          </div>

          <div className="scan-status">
            <CheckCircle2 size={18} />
            Scan Completed
          </div>

        </div>


        {/* ================= SCORE ================= */}

        <section className="result-top-grid">

          <div className="score-card">

            <div className="card-label">
              SECURITY SCORE
            </div>

            <div className={`score-circle ${getScoreClass()}`}>

              <div>
                <strong>{score}</strong>
                <span>/100</span>
              </div>

            </div>

            <h2>
              {getScoreStatus()}
            </h2>

            <p>
              Based on detected security configurations
              and missing security controls.
            </p>

          </div>


          {/* SUMMARY */}

          <div className="summary-card">

            <div className="card-label">
              ISSUE SUMMARY
            </div>

            <div className="summary-grid">

              <div className="summary-item total">
                <span>Total Issues</span>
                <strong>{totalIssues}</strong>
              </div>

              <div className="summary-item high">
                <span>High</span>
                <strong>{high}</strong>
              </div>

              <div className="summary-item medium">
                <span>Medium</span>
                <strong>{medium}</strong>
              </div>

              <div className="summary-item low">
                <span>Low</span>
                <strong>{low}</strong>
              </div>

            </div>

          </div>


          {/* WEBSITE INFO */}

          <div className="info-card">

            <div className="card-label">
              WEBSITE INFORMATION
            </div>

            <div className="info-row">
              <Globe size={17} />
              <span>Status Code</span>
              <strong>{statusCode || "N/A"}</strong>
            </div>

            <div className="info-row">
              <Clock size={17} />
              <span>Response Time</span>
              <strong>
                {responseTime
                  ? `${responseTime} ms`
                  : "N/A"}
              </strong>
            </div>

            <div className="info-row">
              <Lock size={17} />
              <span>Protocol</span>
              <strong>
                {url?.startsWith("https://")
                  ? "HTTPS"
                  : "HTTP"}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= ISSUES ================= */}

        <section className="result-section">

          <div className="section-title">

            <div>
              <span>SECURITY ANALYSIS</span>
              <h2>Detected Issues</h2>
            </div>

            <span className="issue-count">
              {issues.length} issues
            </span>

          </div>


          {issues.length === 0 ? (

            <div className="no-issues">
              <CheckCircle2 size={40} />

              <h3>
                No security issues detected
              </h3>

              <p>
                The scanner did not detect any of the
                configured security checks as failing.
              </p>
            </div>

          ) : (

            <div className="issues-list">

              {issues.map((issue, index) => (

                <div
                  className="issue-card"
                  key={index}
                >

                  <div className="issue-icon">
                    <AlertTriangle size={22} />
                  </div>

                  <div className="issue-content">

                    <div className="issue-top">

                      <h3>
                        {issue.title}
                      </h3>

                      <span
                        className={`severity ${getSeverityClass(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>

                    </div>

                    <p>
                      {issue.description}
                    </p>

                    <div className="recommendation">

                      <strong>
                        Recommendation
                      </strong>

                      <span>
                        {issue.recommendation}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ================= HEADERS ================= */}

        <section className="result-section">

          <div className="section-title">

            <div>
              <span>HTTP SECURITY</span>
              <h2>Security Headers</h2>
            </div>

          </div>

          <div className="headers-grid">

            {headerItems.map((header) => {

              const value =
                securityHeaders[header.key];

              const present = Boolean(value);

              return (
                <div
                  className={`header-card ${
                    present
                      ? "header-present"
                      : "header-missing"
                  }`}
                  key={header.key}
                >

                  <div className="header-status">

                    {present ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <AlertTriangle size={19} />
                    )}

                  </div>

                  <div>

                    <h3>
                      {header.name}
                    </h3>

                    <p>
                      {present
                        ? "Header detected"
                        : "Header not detected"}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* ================= COOKIES ================= */}

        <section className="result-section">

          <div className="section-title">

            <div>
              <span>COOKIE SECURITY</span>
              <h2>Cookie Analysis</h2>
            </div>

            <Cookie size={25} />

          </div>

          {cookies.length === 0 ? (

            <div className="empty-small">
              No cookies detected from the response.
            </div>

          ) : (

            <div className="cookie-table">

              <div className="cookie-row cookie-head">
                <span>Cookie</span>
                <span>Secure</span>
                <span>HttpOnly</span>
                <span>SameSite</span>
              </div>

              {cookies.map((cookie, index) => (

                <div
                  className="cookie-row"
                  key={index}
                >

                  <span>
                    Cookie {index + 1}
                  </span>

                  <span>
                    {cookie.secure ? "✓" : "✕"}
                  </span>

                  <span>
                    {cookie.httpOnly ? "✓" : "✕"}
                  </span>

                  <span>
                    {cookie.sameSite ? "✓" : "✕"}
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ================= TECHNOLOGY ================= */}

        <section className="result-section">

          <div className="technology-card">

            <div className="technology-icon">
              <Server size={27} />
            </div>

            <div>

              <span>
                SERVER ANALYSIS
              </span>

              <h2>
                Technology Detection
              </h2>

              <p>
                Publicly observable server and
                technology information can be
                analyzed here as the scanner expands.
              </p>

            </div>

          </div>

        </section>


        {/* ================= FOOTER ================= */}

        <div className="result-footer">

          <ShieldCheck size={18} />

          SecureScan Security Assessment

          <span>•</span>

          Scan completed successfully

        </div>

      </main>

    </div>
  );
}

export default ScanResult;