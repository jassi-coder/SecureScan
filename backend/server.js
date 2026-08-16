const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("dns").promises;
const net = require("net");

require("dotenv").config();

const { pool, testConnection } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


// =====================================================
// BASIC ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SecureScan API is running",
  });
});


// =====================================================
// AUTH ROUTES
// =====================================================

app.use("/api/auth", authRoutes);


// =====================================================
// HELPERS
// =====================================================

function normalizeHeaderValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join("; ");
  }

  return String(value);
}


// =====================================================
// URL VALIDATION
// =====================================================

function validateUrl(value) {
  try {
    const parsed = new URL(value);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
}


// =====================================================
// PRIVATE IP CHECK
// =====================================================

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return false;
  }

  const [a, b] = parts;

  // 10.0.0.0/8
  if (a === 10) {
    return true;
  }

  // 127.0.0.0/8
  if (a === 127) {
    return true;
  }

  // 169.254.0.0/16
  if (a === 169 && b === 254) {
    return true;
  }

  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  // 192.168.0.0/16
  if (a === 192 && b === 168) {
    return true;
  }

  // 0.0.0.0/8
  if (a === 0) {
    return true;
  }

  return false;
}


function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();

  if (
    lower === "::1" ||
    lower === "::"
  ) {
    return true;
  }

  // IPv6 localhost / link-local / unique-local
  if (
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe8") ||
    lower.startsWith("fe9") ||
    lower.startsWith("fea") ||
    lower.startsWith("feb")
  ) {
    return true;
  }

  return false;
}


// =====================================================
// PRIVATE HOST PROTECTION
// =====================================================

async function isPrivateHost(hostname) {
  const lowerHost = hostname.toLowerCase();

  // Hostnames
  if (
    lowerHost === "localhost" ||
    lowerHost.endsWith(".localhost") ||
    lowerHost.endsWith(".local") ||
    lowerHost.endsWith(".internal")
  ) {
    return true;
  }

  // Direct IP
  if (net.isIP(lowerHost)) {
    if (net.isIPv4(lowerHost)) {
      return isPrivateIPv4(lowerHost);
    }

    return isPrivateIPv6(lowerHost);
  }

  try {
    const addresses = await dns.lookup(hostname, {
      all: true,
      verbatim: true,
    });

    return addresses.some(({ address }) => {
      if (net.isIPv4(address)) {
        return isPrivateIPv4(address);
      }

      if (net.isIPv6(address)) {
        return isPrivateIPv6(address);
      }

      return false;
    });
  } catch {
    return false;
  }
}


// =====================================================
// COOKIE ANALYSIS
// =====================================================

function getCookieDetails(setCookieHeaders = []) {
  return setCookieHeaders.map((cookieString, index) => {
    const parts = cookieString.split(";");

    const name = parts[0]
      ? parts[0].split("=")[0].trim()
      : `Cookie-${index + 1}`;

    const lowerCookie = cookieString.toLowerCase();

    let sameSite = "";

    if (lowerCookie.includes("samesite=strict")) {
      sameSite = "Strict";
    } else if (lowerCookie.includes("samesite=lax")) {
      sameSite = "Lax";
    } else if (lowerCookie.includes("samesite=none")) {
      sameSite = "None";
    }

    return {
      name,
      secure: lowerCookie.includes("secure"),
      httpOnly: lowerCookie.includes("httponly"),
      sameSite,
    };
  });
}


// =====================================================
// SECURITY HEADER ANALYSIS
// =====================================================

function analyzeSecurityHeaders(headers) {
  return {
    "content-security-policy":
      normalizeHeaderValue(
        headers["content-security-policy"]
      ),

    "strict-transport-security":
      normalizeHeaderValue(
        headers["strict-transport-security"]
      ),

    "x-frame-options":
      normalizeHeaderValue(
        headers["x-frame-options"]
      ),

    "x-content-type-options":
      normalizeHeaderValue(
        headers["x-content-type-options"]
      ),

    "referrer-policy":
      normalizeHeaderValue(
        headers["referrer-policy"]
      ),

    "permissions-policy":
      normalizeHeaderValue(
        headers["permissions-policy"]
      ),
  };
}


// =====================================================
// ISSUE GENERATOR
// =====================================================

function generateIssues(securityHeaders, protocol) {
  const issues = [];

  if (!securityHeaders["content-security-policy"]) {
    issues.push({
      title: "Content Security Policy Missing",
      severity: "High",
      description:
        "Content-Security-Policy was not detected in the HTTP response.",
      recommendation:
        "Configure an appropriate Content-Security-Policy for the website.",
    });
  }

  if (
    protocol === "https:" &&
    !securityHeaders["strict-transport-security"]
  ) {
    issues.push({
      title: "HSTS Header Missing",
      severity: "Medium",
      description:
        "Strict-Transport-Security was not detected in the HTTPS response.",
      recommendation:
        "Configure HTTP Strict Transport Security (HSTS).",
    });
  }

  if (!securityHeaders["x-frame-options"]) {
    const csp = securityHeaders["content-security-policy"];

    const hasFrameAncestors =
      /frame-ancestors/i.test(csp);

    if (!hasFrameAncestors) {
      issues.push({
        title: "Clickjacking Protection Missing",
        severity: "Medium",
        description:
          "Neither X-Frame-Options nor a CSP frame-ancestors directive was detected.",
        recommendation:
          "Configure X-Frame-Options or CSP frame-ancestors.",
      });
    }
  }

  if (
    securityHeaders["x-content-type-options"]
      .toLowerCase() !== "nosniff"
  ) {
    issues.push({
      title: "MIME Sniffing Protection Missing",
      severity: "Low",
      description:
        "X-Content-Type-Options: nosniff was not detected.",
      recommendation:
        "Set X-Content-Type-Options to nosniff.",
    });
  }

  if (!securityHeaders["referrer-policy"]) {
    issues.push({
      title: "Referrer Policy Missing",
      severity: "Low",
      description:
        "Referrer-Policy was not detected in the HTTP response.",
      recommendation:
        "Configure an appropriate Referrer-Policy.",
    });
  }

  if (!securityHeaders["permissions-policy"]) {
    issues.push({
      title: "Permissions Policy Missing",
      severity: "Low",
      description:
        "Permissions-Policy was not detected in the HTTP response.",
      recommendation:
        "Configure Permissions-Policy according to the website's requirements.",
    });
  }

  return issues;
}


// =====================================================
// SCORE
// =====================================================

function calculateScore(issues) {
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === "High") {
      score -= 20;
    } else if (issue.severity === "Medium") {
      score -= 10;
    } else if (issue.severity === "Low") {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}


// =====================================================
// TECHNOLOGY DETECTION
// =====================================================

function detectTechnology(headers, html) {
  const technologies = [];

  const server = normalizeHeaderValue(
    headers["server"]
  );

  const poweredBy = normalizeHeaderValue(
    headers["x-powered-by"]
  );

  if (server) {
    technologies.push({
      type: "Server",
      value: server,
    });
  }

  if (poweredBy) {
    technologies.push({
      type: "X-Powered-By",
      value: poweredBy,
    });
  }

  if (html) {
    const $ = cheerio.load(html);

    const generator = $(
      'meta[name="generator"]'
    )
      .attr("content");

    if (generator) {
      technologies.push({
        type: "Generator",
        value: generator,
      });
    }

    if ($(
      'script[src*="wp-content"]'
    ).length > 0) {
      technologies.push({
        type: "CMS",
        value: "WordPress",
      });
    }

    if ($(
      'script[src*="_next/"]'
    ).length > 0) {
      technologies.push({
        type: "Framework",
        value: "Next.js",
      });
    }
  }

  return technologies;
}


// =====================================================
// SCAN WEBSITE
// =====================================================

app.post("/api/scan", async (req, res) => {
  const startTime = Date.now();

  try {
    const { url, userId } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Website URL is required",
      });
    }

    let targetUrl = url.trim();

    if (
      !targetUrl.startsWith("http://") &&
      !targetUrl.startsWith("https://")
    ) {
      targetUrl = `https://${targetUrl}`;
    }

    if (!validateUrl(targetUrl)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid HTTP/HTTPS URL",
      });
    }

    const parsedUrl = new URL(targetUrl);

    // -----------------------------------------------
    // SSRF PROTECTION
    // -----------------------------------------------

    if (
      await isPrivateHost(
        parsedUrl.hostname
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Private or local URLs cannot be scanned",
      });
    }

    // -----------------------------------------------
    // REAL WEBSITE REQUEST
    // -----------------------------------------------

    let response;

    try {
      response = await axios.get(targetUrl, {
        timeout: 15000,

        maxRedirects: 5,

        validateStatus: () => true,

        headers: {
          "User-Agent":
            "SecureScan/1.0 Security Scanner",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    } catch (error) {
      console.error(
        "Website request error:",
        error.message
      );

      return res.status(502).json({
        success: false,
        message:
          "Unable to connect to the website.",
      });
    }

    // -----------------------------------------------
    // REAL RESPONSE INFORMATION
    // -----------------------------------------------

    const responseTime =
      Date.now() - startTime;

    const statusCode = response.status;

    const headers =
      response.headers || {};

    const protocol =
      parsedUrl.protocol;

    // -----------------------------------------------
    // SECURITY HEADERS
    // -----------------------------------------------

    const securityHeaders =
      analyzeSecurityHeaders(headers);

    // -----------------------------------------------
    // COOKIES
    // -----------------------------------------------

    const setCookieHeaders =
      headers["set-cookie"] || [];

    const cookies =
      getCookieDetails(
        setCookieHeaders
      );

    // -----------------------------------------------
    // HTML
    // -----------------------------------------------

    let pageTitle = "";

    let html = "";

    if (
      typeof response.data === "string"
    ) {
      html = response.data;

      try {
        const $ =
          cheerio.load(html);

        pageTitle =
          $("title")
            .first()
            .text()
            .trim();
      } catch {
        pageTitle = "";
      }
    }

    // -----------------------------------------------
    // TECHNOLOGY
    // -----------------------------------------------

    const technologies =
      detectTechnology(
        headers,
        html
      );

    // -----------------------------------------------
    // ISSUES
    // -----------------------------------------------

    const issues =
      generateIssues(
        securityHeaders,
        protocol
      );

    // -----------------------------------------------
    // SUMMARY
    // -----------------------------------------------

    const high =
      issues.filter(
        (issue) =>
          issue.severity === "High"
      ).length;

    const medium =
      issues.filter(
        (issue) =>
          issue.severity === "Medium"
      ).length;

    const low =
      issues.filter(
        (issue) =>
          issue.severity === "Low"
      ).length;

    const totalIssues =
      issues.length;

    // -----------------------------------------------
    // SCORE
    // -----------------------------------------------

    const score =
      calculateScore(issues);

    // -----------------------------------------------
    // SCAN OBJECT
    // -----------------------------------------------

    const scan = {
      url: targetUrl,

      statusCode,

      responseTime,

      protocol:
        protocol.replace(":", "")
          .toUpperCase(),

      score,

      summary: {
        high,
        medium,
        low,
        totalIssues,
      },

      securityHeaders,

      cookies,

      issues,

      technology: {
        pageTitle,
        technologies,
        server:
          normalizeHeaderValue(
            headers["server"]
          ),
        poweredBy:
          normalizeHeaderValue(
            headers["x-powered-by"]
          ),
      },
    };

    // -----------------------------------------------
    // SAVE TO MYSQL
    // -----------------------------------------------

    let savedScanId = null;

    try {
      const parsedUserId =
        userId
          ? Number(userId)
          : null;

      const safeUserId =
        Number.isInteger(
          parsedUserId
        ) &&
        parsedUserId > 0
          ? parsedUserId
          : null;

      const [result] =
        await pool.execute(
          `
          INSERT INTO scans
          (
            user_id,
            url,
            status_code,
            response_time,
            score,
            summary,
            security_headers,
            cookies,
            issues
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            safeUserId,
            targetUrl,
            statusCode,
            responseTime,
            score,
            JSON.stringify(
              scan.summary
            ),
            JSON.stringify(
              scan.securityHeaders
            ),
            JSON.stringify(
              scan.cookies
            ),
            JSON.stringify(
              scan.issues
            ),
          ]
        );

      savedScanId =
        result.insertId;

      console.log(
        "Saved Scan ID:",
        savedScanId
      );

    } catch (dbError) {
      console.error(
        "Scan database save failed:",
        dbError.message
      );
    }

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.json({
      success: true,

      message:
        "Real security scan completed",

      scan: {
        ...scan,
        scanId:
          savedScanId,
      },
    });

  } catch (error) {
    console.error(
      "Scan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Security scan failed",
    });
  }
});


// =====================================================
// SCAN HISTORY
// =====================================================

app.get("/api/scans", async (req, res) => {
  try {
    const userId =
      Number(req.query.userId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid userId is required",
      });
    }

    const [rows] =
      await pool.execute(
        `
        SELECT
          id,
          url,
          status_code,
          response_time,
          score,
          summary,
          created_at
        FROM scans
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
      );

    return res.json({
      success: true,
      scans: rows,
    });

  } catch (error) {
    console.error(
      "Scan history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch scan history",
    });
  }
});


// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      "API route not found",
  });
});


// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log("");
      console.log(
        "===================================="
      );
      console.log(
        "🚀 SecureScan Backend Started"
      );
      console.log(
        `📡 Server: http://localhost:${PORT}`
      );
      console.log(
        `🌐 Frontend: ${process.env.FRONTEND_URL}`
      );
      console.log(
        "🔐 Real Security Analysis Enabled"
      );
      console.log(
        "===================================="
      );
      console.log("");
    });

  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
}

startServer();