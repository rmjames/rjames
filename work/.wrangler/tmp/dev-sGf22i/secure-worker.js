var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-C2azHS/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// secure-worker.js
function getConfig(env) {
  return {
    // Security Settings
    SESSION_DURATION: parseInt(env.SESSION_DURATION || "3600", 10),
    MAX_LOGIN_ATTEMPTS: parseInt(env.MAX_LOGIN_ATTEMPTS || "5", 10),
    LOCKOUT_DURATION: parseInt(env.LOCKOUT_DURATION || "900", 10),
    PASSWORD_MIN_LENGTH: parseInt(env.PASSWORD_MIN_LENGTH || "8", 10),
    // Cookie Settings
    COOKIE_NAME: env.COOKIE_NAME || "__Secure-auth",
    COOKIE_DOMAIN: env.COOKIE_DOMAIN || "",
    // Protected Paths
    PROTECTED_PATHS: (env.PROTECTED_PATHS || "/portfolio/").split(",").map((p) => p.trim()),
    // Portfolio Projects (maps project slug to password hash environment variable)
    PORTFOLIO_PROJECTS: {
      "corteva": "PASSWORD_HASH_CORTEVA",
      "microsoft": "PASSWORD_HASH_MICROSOFT",
      "bank-of-america": "PASSWORD_HASH_BANK_OF_AMERICA",
      "royal-caribbean": "PASSWORD_HASH_ROYAL_CARIBBEAN",
      "weber-shandwick": "PASSWORD_HASH_WEBER_SHANDWICK",
      "macmillan": "PASSWORD_HASH_MACMILLAN",
      "guardian": "PASSWORD_HASH_GUARDIAN",
      "sbe": "PASSWORD_HASH_SBE"
    },
    // Security Headers
    SECURITY_HEADERS: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
    }
  };
}
__name(getConfig, "getConfig");
var PORTFOLIO_DATA = {
  corteva: {
    company: "Corteva",
    industry: "Agricultural Technology",
    role: "Senior UX Engineer",
    duration: "2021 - 2022",
    description: "Worked on a team that built a blockchain-based tracking and traceability system from research through development. Including a mobile web app for production line management.",
    challenges: [
      "Complex data tracking across multiple production stages",
      "Mobile-first design for factory floor workers",
      "Real-time blockchain integration for traceability"
    ],
    solutions: [
      "Developed intuitive mobile web interface for production line scanning",
      "Implemented real-time data synchronization with blockchain backend",
      "Created accessible components for diverse user base"
    ],
    impact: [
      "Reduced manual data entry errors by 40%",
      "Improved product traceability across supply chain",
      "Enabled compliance with regulatory requirements"
    ],
    technologies: ["React", "TypeScript", "Blockchain", "Progressive Web Apps", "Mobile UX"]
  },
  microsoft: {
    company: "Microsoft",
    industry: "Technology",
    role: "UX Engineer",
    duration: "2020 - 2021",
    description: "Worked on a team that delivered a royalties payment processing system using blockchain technology, achieving 99% reduction in processing time.",
    challenges: [
      "Legacy payment processing taking days to complete",
      "Complex royalty calculation workflows",
      "Integration with existing Microsoft infrastructure"
    ],
    solutions: [
      "Built modern web interface for royalty management",
      "Implemented blockchain-based automated payment processing",
      "Created real-time analytics dashboard for stakeholders"
    ],
    impact: [
      "99% reduction in payment processing time",
      "Automated complex royalty calculations",
      "Improved transparency for content creators"
    ],
    technologies: ["Angular", "Azure", "Blockchain", "TypeScript", "Data Visualization"]
  },
  "bank-of-america": {
    company: "Bank of America",
    industry: "Financial Services",
    role: "Frontend Developer",
    duration: "2019 - 2020",
    description: "Worked on a team that implemented a blockchain solution to streamline loan payment processes, resulting in faster transaction times and reduced manual effort.",
    challenges: [
      "Manual loan payment processing causing delays",
      "Complex regulatory compliance requirements",
      "Integration with legacy banking systems"
    ],
    solutions: [
      "Developed secure payment processing interface",
      "Implemented blockchain-based transaction ledger",
      "Created compliance reporting dashboard"
    ],
    impact: [
      "Reduced payment processing time by 60%",
      "Minimized manual intervention and errors",
      "Improved audit trail and compliance reporting"
    ],
    technologies: ["React", "Redux", "Node.js", "Blockchain", "Security"]
  },
  "royal-caribbean": {
    company: "Royal Caribbean",
    industry: "Media & Entertainment",
    role: "DevOps Engineer",
    duration: "2019",
    description: "I was part of a team that collaborated with the client to optimize CI/CD infrastructure across multiple teams resulting in improved efficiency and faster deployments.",
    challenges: [
      "Slow deployment cycles across multiple teams",
      "Inconsistent infrastructure configurations",
      "Limited visibility into deployment status"
    ],
    solutions: [
      "Standardized CI/CD pipelines across teams",
      "Implemented automated testing and deployment workflows",
      "Created centralized monitoring and alerting system"
    ],
    impact: [
      "50% reduction in deployment time",
      "Improved team collaboration and efficiency",
      "Reduced production incidents"
    ],
    technologies: ["Jenkins", "Docker", "Kubernetes", "AWS", "Monitoring"]
  },
  "weber-shandwick": {
    company: "Weber Shandwick (Large Retail Pharmacy)",
    industry: "Healthcare / Retail",
    role: "Frontend Developer",
    duration: "2018 - 2019",
    description: "I was part of the team that launched a curbside pickup checkout flow for pharmacy prescriptions, reducing customer wait times and creating reusable accessible components.",
    challenges: [
      "Complex prescription pickup workflow",
      "Accessibility requirements for diverse user base",
      "Integration with existing pharmacy systems"
    ],
    solutions: [
      "Designed intuitive curbside pickup interface",
      "Built WCAG 2.1 AA compliant component library",
      "Implemented real-time order status tracking"
    ],
    impact: [
      "Reduced customer wait times by 45%",
      "Improved customer satisfaction scores",
      "Created reusable component library for future features"
    ],
    technologies: ["React", "Accessibility", "Component Libraries", "UX Design", "Mobile"]
  },
  macmillan: {
    company: "Macmillan Learning",
    industry: "Publishing & Education",
    role: "Full Stack Developer",
    duration: "2017 - 2018",
    description: "Worked on a team that developed and launched Question Bank Editor, an internal tool for content editors to curate educational questions, plus platform bug fixes.",
    challenges: [
      "Inefficient manual question curation process",
      "Complex question formatting and metadata requirements",
      "Need for real-time collaboration features"
    ],
    solutions: [
      "Built rich text editor with specialized question formatting",
      "Implemented tagging and categorization system",
      "Created collaborative editing features"
    ],
    impact: [
      "Reduced question curation time by 70%",
      "Improved content quality and consistency",
      "Enabled scalable content production workflow"
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Rich Text Editing", "Collaboration"]
  },
  guardian: {
    company: "Guardian Life Insurance",
    industry: "Insurance",
    role: "Frontend Developer",
    duration: "2016 - 2017",
    description: "Built out pages for Guardian's My Account Management Portal improving customer self-service capabilities.",
    challenges: [
      "Legacy account management system lacking self-service",
      "Complex insurance policy information display",
      "Mobile responsiveness requirements"
    ],
    solutions: [
      "Redesigned account dashboard with modern UI",
      "Implemented policy document management system",
      "Created responsive mobile-first layouts"
    ],
    impact: [
      "Increased self-service adoption by 55%",
      "Reduced customer support calls",
      "Improved mobile user experience"
    ],
    technologies: ["JavaScript", "HTML/CSS", "Responsive Design", "UX", "Forms"]
  },
  sbe: {
    company: "sbe Entertainment",
    industry: "Hospitality & Entertainment",
    role: "Email Developer",
    duration: "2015 - 2016",
    description: "At sbe.com I contributed to marketing campaigns through HTML email development for their hospitality brand.",
    challenges: [
      "Cross-email client compatibility issues",
      "Maintaining brand consistency across campaigns",
      "Responsive email design for mobile devices"
    ],
    solutions: [
      "Developed modular email template system",
      "Created comprehensive testing workflow",
      "Implemented responsive email patterns"
    ],
    impact: [
      "Improved email open rates by 25%",
      "Reduced email production time",
      "Ensured consistent brand experience"
    ],
    technologies: ["HTML Email", "CSS", "Email Clients", "Marketing", "Responsive Design"]
  }
};
function generatePortfolioHTML(projectSlug) {
  const project = PORTFOLIO_DATA[projectSlug];
  if (!project) {
    return null;
  }
  return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#212121" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#dee1e3" media="(prefers-color-scheme: light)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex, nofollow" />
        <title>${project.company} - Portfolio | Robert James</title>
        <link rel="preload" href="/fonts/recursive-variable.woff2" as="font" type="font/woff2" crossorigin />
        <link rel="preload" href="/styles/fonts.css" as="style" />
        <link rel="preload" href="/styles/main.css" as="style" />
        <link rel="stylesheet" href="/styles/fonts.css" media="print" onload="this.media='all'" />
        <noscript><link rel="stylesheet" href="/styles/fonts.css" /></noscript>
        <link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'" />
        <noscript><link rel="stylesheet" href="/styles/main.css" /></noscript>
        <link rel="icon" type="image/svg+xml" href="/images/icon.svg" />
        <style>
            .portfolio-container {
                max-width: 60rem;
                margin: 0 auto;
                padding: var(--xxl) var(--m);
            }
            .portfolio-header {
                margin-bottom: var(--xxxl);
                padding-bottom: var(--xl);
                border-bottom: 1px solid var(--gray-1);
            }
            .portfolio-title {
                font-size: clamp(2rem, 5vw, 3rem);
                margin-bottom: var(--m);
                --recursive-wght: 800;
            }
            .portfolio-meta {
                display: flex;
                flex-wrap: wrap;
                gap: var(--xl);
                margin-top: var(--l);
                color: var(--gray-1);
                font-size: 0.9rem;
            }
            .portfolio-meta-item {
                display: flex;
                flex-direction: column;
                gap: var(--xs);
            }
            .portfolio-meta-label {
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.75rem;
                letter-spacing: 0.05em;
                color: var(--gray-2);
            }
            .portfolio-section {
                margin-bottom: var(--xxxl);
            }
            .portfolio-section-title {
                font-size: clamp(1.5rem, 3vw, 2rem);
                margin-bottom: var(--l);
                --recursive-wght: 700;
            }
            .portfolio-description {
                font-size: 1.1rem;
                line-height: 1.7;
                margin-bottom: var(--xl);
            }
            .portfolio-list {
                list-style: none;
                padding: 0;
            }
            .portfolio-list li {
                padding: var(--m) 0;
                padding-left: var(--xl);
                position: relative;
                line-height: 1.6;
            }
            .portfolio-list li::before {
                content: "\u2192";
                position: absolute;
                left: 0;
                color: var(--blue-2);
                font-weight: bold;
            }
            .portfolio-technologies {
                display: flex;
                flex-wrap: wrap;
                gap: var(--s);
                margin-top: var(--l);
            }
            .portfolio-tech-tag {
                background: var(--gray-1);
                color: var(--white-1);
                padding: var(--xs) var(--m);
                border-radius: var(--border-radius);
                font-size: 0.85rem;
                font-weight: 500;
            }
            .portfolio-placeholder-image {
                width: 100%;
                aspect-ratio: 16 / 9;
                background: linear-gradient(135deg, var(--gray-1) 0%, var(--gray-2) 100%);
                border-radius: var(--border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--white-1);
                font-size: 1.2rem;
                margin: var(--xl) 0;
            }
            .back-link {
                display: inline-flex;
                align-items: center;
                gap: var(--s);
                margin-bottom: var(--xl);
                color: var(--blue-2);
                text-decoration: none;
                transition: opacity 0.2s;
            }
            .back-link:hover {
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="portfolio-container">
            <a href="/" class="back-link">\u2190 Back to Home</a>
            <header class="portfolio-header">
                <h1 class="portfolio-title">${project.company}</h1>
                <p class="portfolio-description">${project.description}</p>
                <div class="portfolio-meta">
                    <div class="portfolio-meta-item">
                        <span class="portfolio-meta-label">Industry</span>
                        <span>${project.industry}</span>
                    </div>
                    <div class="portfolio-meta-item">
                        <span class="portfolio-meta-label">Role</span>
                        <span>${project.role}</span>
                    </div>
                    <div class="portfolio-meta-item">
                        <span class="portfolio-meta-label">Duration</span>
                        <span>${project.duration}</span>
                    </div>
                </div>
            </header>
            <div class="portfolio-placeholder-image">[Project Screenshot Placeholder]</div>
            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Challenges</h2>
                <ul class="portfolio-list">
                    ${project.challenges.map((c) => `<li>${c}</li>`).join("")}
                </ul>
            </section>
            <div class="portfolio-placeholder-image">[Design Process Placeholder]</div>
            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Solutions</h2>
                <ul class="portfolio-list">
                    ${project.solutions.map((s) => `<li>${s}</li>`).join("")}
                </ul>
            </section>
            <div class="portfolio-placeholder-image">[Implementation Screenshot Placeholder]</div>
            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Impact</h2>
                <ul class="portfolio-list">
                    ${project.impact.map((i) => `<li>${i}</li>`).join("")}
                </ul>
            </section>
            <section class="portfolio-section">
                <h2 class="portfolio-section-title">Technologies</h2>
                <div class="portfolio-technologies">
                    ${project.technologies.map((tech) => `<span class="portfolio-tech-tag">${tech}</span>`).join("")}
                </div>
            </section>
        </div>
    </body>
</html>`;
}
__name(generatePortfolioHTML, "generatePortfolioHTML");
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
async function generateSecureToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(generateSecureToken, "generateSecureToken");
async function verifyPassword(password, storedHash) {
  const inputHash = await hashPassword(password);
  return timingSafeEqual(inputHash, storedHash);
}
__name(verifyPassword, "verifyPassword");
async function checkRateLimit(ip, kv, CONFIG) {
  const key = `ratelimit:${ip}`;
  const data = await kv.get(key, "json");
  if (!data) {
    return { limited: false, attempts: 0 };
  }
  const now = Date.now();
  if (data.lockedUntil && data.lockedUntil > now) {
    const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1e3);
    return {
      limited: true,
      locked: true,
      remainingSeconds,
      attempts: data.attempts
    };
  }
  if (data.lockedUntil && data.lockedUntil <= now) {
    await kv.delete(key);
    return { limited: false, attempts: 0 };
  }
  return {
    limited: data.attempts >= CONFIG.MAX_LOGIN_ATTEMPTS,
    attempts: data.attempts
  };
}
__name(checkRateLimit, "checkRateLimit");
async function recordFailedAttempt(ip, kv, CONFIG) {
  const key = `ratelimit:${ip}`;
  const data = await kv.get(key, "json") || { attempts: 0 };
  data.attempts++;
  data.lastAttempt = Date.now();
  if (data.attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
    data.lockedUntil = Date.now() + CONFIG.LOCKOUT_DURATION * 1e3;
  }
  await kv.put(key, JSON.stringify(data), {
    expirationTtl: CONFIG.LOCKOUT_DURATION
  });
}
__name(recordFailedAttempt, "recordFailedAttempt");
async function clearRateLimit(ip, kv) {
  await kv.delete(`ratelimit:${ip}`);
}
__name(clearRateLimit, "clearRateLimit");
async function createSession(ip, project, kv, CONFIG) {
  const sessionToken = await generateSecureToken();
  const sessionData = {
    ip,
    project,
    createdAt: Date.now(),
    expiresAt: Date.now() + CONFIG.SESSION_DURATION * 1e3
  };
  await kv.put(
    `session:${sessionToken}`,
    JSON.stringify(sessionData),
    { expirationTtl: CONFIG.SESSION_DURATION }
  );
  return sessionToken;
}
__name(createSession, "createSession");
async function getSessionData(token, kv) {
  if (!token) return null;
  const sessionData = await kv.get(`session:${token}`, "json");
  if (!sessionData) return null;
  const now = Date.now();
  if (sessionData.expiresAt < now) {
    await kv.delete(`session:${token}`);
    return null;
  }
  return sessionData;
}
__name(getSessionData, "getSessionData");
async function destroySession(token, kv) {
  await kv.delete(`session:${token}`);
}
__name(destroySession, "destroySession");
function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});
  return cookies[name] || null;
}
__name(getCookie, "getCookie");
function createSecureCookie(name, value, CONFIG, maxAge = null) {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict"
  ];
  const cookieMaxAge = maxAge !== null ? maxAge : CONFIG.SESSION_DURATION;
  if (cookieMaxAge > 0) {
    parts.push(`Max-Age=${cookieMaxAge}`);
  } else {
    parts.push("Max-Age=0");
  }
  if (CONFIG.COOKIE_DOMAIN) {
    parts.push(`Domain=${CONFIG.COOKIE_DOMAIN}`);
  }
  return parts.join("; ");
}
__name(createSecureCookie, "createSecureCookie");
function addSecurityHeaders(response, CONFIG) {
  const headers = new Headers(response.headers);
  Object.entries(CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
__name(addSecurityHeaders, "addSecurityHeaders");
function getClientIP(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0].trim() || "unknown";
}
__name(getClientIP, "getClientIP");
async function proxyToOrigin(request, env) {
  const isDevelopment = env.ENVIRONMENT === "development";
  if (isDevelopment) {
    const url = new URL(request.url);
    const devOriginUrl = env.DEV_ORIGIN_URL || "http://localhost:3000";
    const originUrl = `${devOriginUrl}${url.pathname}${url.search}`;
    return fetch(originUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }
  return fetch(request);
}
__name(proxyToOrigin, "proxyToOrigin");
var LOGIN_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Protected Access</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background: var(--bkgnd);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1rem;
        }
        .login-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 100%;
            padding: 2.5rem;
        }
        h1 {
            color: #333;
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            color: #333;
            font-weight: 500;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        input[type="password"] {
            width: 100%;
            padding: 0.875rem;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button {
            width: 100%;
            padding: 0.875rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        button:active:not(:disabled) {
            transform: translateY(0);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 0.875rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: none;
            font-size: 0.9rem;
        }
        .error.show { display: block; }
        .loading {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.6s linear infinite;
            margin-left: 8px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .security-notice {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e0e0e0;
            font-size: 0.8rem;
            color: #999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>\u{1F512} Protected Access</h1>
        <p class="subtitle">Enter password to view work samples</p>

        <div id="error" class="error"></div>

        <form id="loginForm">
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    autocomplete="off"
                    required
                    minlength="8"
                    autofocus
                >
            </div>

            <button type="submit" id="submitBtn">
                <span id="btnText">Access Content</span>
            </button>
        </form>

        <div class="security-notice">
            \u{1F510} Secured by Cloudflare Workers
        </div>
    </div>

    <script>
        const form = document.getElementById('loginForm');
        const errorDiv = document.getElementById('error');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            errorDiv.classList.remove('show');
            submitBtn.disabled = true;
            btnText.innerHTML = 'Verifying<span class="loading"></span>';

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    btnText.textContent = 'Success! Redirecting...';
                    setTimeout(() => window.location.reload(), 500);
                } else {
                    errorDiv.textContent = data.message || 'Authentication failed';
                    errorDiv.classList.add('show');
                    document.getElementById('password').value = '';
                    document.getElementById('password').focus();
                }
            } catch (error) {
                errorDiv.textContent = 'Connection error. Please try again.';
                errorDiv.classList.add('show');
            } finally {
                submitBtn.disabled = false;
                btnText.textContent = 'Access Content';
            }
        });
    <\/script>
</body>
</html>
`;
function generateLoginHTML(projectSlug) {
  const project = PORTFOLIO_DATA[projectSlug];
  const projectName = project ? project.company : "Portfolio";
  return LOGIN_HTML.replace(
    '<p class="subtitle">Enter password to view work samples</p>',
    `<p class="subtitle">Enter password to view ${projectName} portfolio</p>`
  ).replace(
    "const response = await fetch('/auth/login',",
    `const response = await fetch('/auth/login?project=${projectSlug}',`
  );
}
__name(generateLoginHTML, "generateLoginHTML");
var secure_worker_default = {
  async fetch(request, env) {
    const CONFIG = getConfig(env);
    const url = new URL(request.url);
    const clientIP = getClientIP(request);
    const isDevelopment = env.ENVIRONMENT === "development";
    if (url.protocol !== "https:" && !isDevelopment) {
      return Response.redirect(
        `https://${url.hostname}${url.pathname}${url.search}`,
        301
      );
    }
    if (url.pathname === "/auth/login" && request.method === "POST") {
      return handleLogin(request, env, clientIP, CONFIG);
    }
    if (url.pathname === "/auth/logout") {
      return handleLogout(request, env, CONFIG);
    }
    const portfolioMatch = url.pathname.match(/^\/portfolio\/([^/]+)\/?$/);
    if (portfolioMatch) {
      const projectSlug = portfolioMatch[1];
      if (!CONFIG.PORTFOLIO_PROJECTS[projectSlug]) {
        return new Response("Project not found", { status: 404 });
      }
      const sessionToken = getCookie(request, CONFIG.COOKIE_NAME);
      const session = await getSessionData(sessionToken, env.KV);
      const isAuthenticated = session && session.project === projectSlug && session.ip === clientIP;
      if (isAuthenticated) {
        const portfolioHTML = generatePortfolioHTML(projectSlug);
        return addSecurityHeaders(
          new Response(portfolioHTML, {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=UTF-8",
              "Cache-Control": "private, no-store, no-cache, must-revalidate"
            }
          }),
          CONFIG
        );
      }
      const loginHTML = generateLoginHTML(projectSlug);
      return addSecurityHeaders(
        new Response(loginHTML, {
          status: 401,
          headers: {
            "Content-Type": "text/html; charset=UTF-8",
            "Cache-Control": "private, no-store, no-cache, must-revalidate"
          }
        }),
        CONFIG
      );
    }
    const requiresAuth = CONFIG.PROTECTED_PATHS.some(
      (path) => url.pathname.startsWith(path)
    );
    if (!requiresAuth) {
      return addSecurityHeaders(await proxyToOrigin(request, env), CONFIG);
    }
    return addSecurityHeaders(
      new Response(LOGIN_HTML, {
        status: 401,
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "private, no-store, no-cache, must-revalidate"
        }
      }),
      CONFIG
    );
  }
};
async function handleLogin(request, env, clientIP, CONFIG) {
  const url = new URL(request.url);
  const projectSlug = url.searchParams.get("project");
  if (!projectSlug || !CONFIG.PORTFOLIO_PROJECTS[projectSlug]) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid project" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const rateLimit = await checkRateLimit(clientIP, env.KV, CONFIG);
  if (rateLimit.limited || rateLimit.locked) {
    return new Response(
      JSON.stringify({
        success: false,
        message: rateLimit.locked ? `Too many failed attempts. Locked for ${rateLimit.remainingSeconds} seconds.` : "Too many failed attempts. Please try again later."
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": rateLimit.remainingSeconds || CONFIG.LOCKOUT_DURATION
        }
      }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const { password } = body;
  if (!password || password.length < CONFIG.PASSWORD_MIN_LENGTH) {
    await recordFailedAttempt(clientIP, env.KV, CONFIG);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid password" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const passwordHashKey = CONFIG.PORTFOLIO_PROJECTS[projectSlug];
  const storedPasswordHash = env[passwordHashKey];
  if (!storedPasswordHash) {
    return new Response(
      JSON.stringify({ success: false, message: "Configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const isValid = await verifyPassword(password, storedPasswordHash);
  if (!isValid) {
    await recordFailedAttempt(clientIP, env.KV, CONFIG);
    const remaining = CONFIG.MAX_LOGIN_ATTEMPTS - (rateLimit.attempts + 1);
    return new Response(
      JSON.stringify({
        success: false,
        message: remaining > 0 ? `Invalid password. ${remaining} attempts remaining.` : "Too many failed attempts."
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  await clearRateLimit(clientIP, env.KV);
  const sessionToken = await createSession(clientIP, projectSlug, env.KV, CONFIG);
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": createSecureCookie(CONFIG.COOKIE_NAME, sessionToken, CONFIG)
      }
    }
  );
}
__name(handleLogin, "handleLogin");
async function handleLogout(request, env, CONFIG) {
  const sessionToken = getCookie(request, CONFIG.COOKIE_NAME);
  if (sessionToken) {
    await destroySession(sessionToken, env.KV);
  }
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/",
      "Set-Cookie": createSecureCookie(CONFIG.COOKIE_NAME, "", CONFIG, 0)
    }
  });
}
__name(handleLogout, "handleLogout");

// ../../../.npm-global/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.npm-global/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-C2azHS/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = secure_worker_default;

// ../../../.npm-global/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-C2azHS/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=secure-worker.js.map
