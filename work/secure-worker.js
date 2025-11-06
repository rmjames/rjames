/**
 * SECURE CLOUDFLARE WORKER - Production-Ready Authentication
 *
 * Security Features:
 * ✅ Password hashing with Web Crypto API
 * ✅ Timing-safe password comparison
 * ✅ Rate limiting with KV storage
 * ✅ Brute force protection
 * ✅ IP-based lockouts
 * ✅ Secure cookie handling
 * ✅ HTTPS enforcement
 * ✅ Security headers
 * ✅ CSRF protection
 * ✅ Session management
 *
 * Documentation: https://developers.cloudflare.com/workers/
 * Security Guide: https://developers.cloudflare.com/workers/platform/security/
 */

import { PORTFOLIO_DATA, generatePortfolioHTML } from './portfolio-template.js';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Get configuration from environment variables
 * @param {Object} env - Environment variables
 * @returns {Object} Configuration object
 */
function getConfig(env) {
  return {
    // Security Settings
    SESSION_DURATION: parseInt(env.SESSION_DURATION || '3600', 10),
    MAX_LOGIN_ATTEMPTS: parseInt(env.MAX_LOGIN_ATTEMPTS || '5', 10),
    LOCKOUT_DURATION: parseInt(env.LOCKOUT_DURATION || '900', 10),
    PASSWORD_MIN_LENGTH: parseInt(env.PASSWORD_MIN_LENGTH || '8', 10),

    // Cookie Settings
    COOKIE_NAME: env.COOKIE_NAME || '__Secure-auth',
    COOKIE_DOMAIN: env.COOKIE_DOMAIN || '',

    // Protected Paths
    PROTECTED_PATHS: (env.PROTECTED_PATHS || '/portfolio/').split(',').map(p => p.trim()),

    // Portfolio Projects (maps project slug to password hash environment variable)
    PORTFOLIO_PROJECTS: {
      'corteva': 'PASSWORD_HASH_CORTEVA',
      'microsoft': 'PASSWORD_HASH_MICROSOFT',
      'bank-of-america': 'PASSWORD_HASH_BANK_OF_AMERICA',
      'royal-caribbean': 'PASSWORD_HASH_ROYAL_CARIBBEAN',
      'weber-shandwick': 'PASSWORD_HASH_WEBER_SHANDWICK',
      'macmillan': 'PASSWORD_HASH_MACMILLAN',
      'guardian': 'PASSWORD_HASH_GUARDIAN',
      'sbe': 'PASSWORD_HASH_SBE',
    },

    // Security Headers
    SECURITY_HEADERS: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    },
  };
}

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Hash password using SHA-256
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
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

/**
 * Generate cryptographically secure random token
 * @returns {Promise<string>} Random token
 */
async function generateSecureToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against stored hash
 * @param {string} password - Password to verify
 * @param {string} storedHash - Stored password hash
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, storedHash) {
  const inputHash = await hashPassword(password);
  return timingSafeEqual(inputHash, storedHash);
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Check if IP is rate limited
 * @param {string} ip - Client IP address
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @param {Object} CONFIG - Configuration object
 * @returns {Promise<Object>} Rate limit status
 */
async function checkRateLimit(ip, kv, CONFIG) {
  const key = `ratelimit:${ip}`;
  const data = await kv.get(key, 'json');

  if (!data) {
    return { limited: false, attempts: 0 };
  }

  const now = Date.now();

  // Check if locked out
  if (data.lockedUntil && data.lockedUntil > now) {
    const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
    return {
      limited: true,
      locked: true,
      remainingSeconds,
      attempts: data.attempts,
    };
  }

  // Lockout expired, reset
  if (data.lockedUntil && data.lockedUntil <= now) {
    await kv.delete(key);
    return { limited: false, attempts: 0 };
  }

  return {
    limited: data.attempts >= CONFIG.MAX_LOGIN_ATTEMPTS,
    attempts: data.attempts,
  };
}

/**
 * Record failed login attempt
 * @param {string} ip - Client IP address
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @param {Object} CONFIG - Configuration object
 */
async function recordFailedAttempt(ip, kv, CONFIG) {
  const key = `ratelimit:${ip}`;
  const data = await kv.get(key, 'json') || { attempts: 0 };

  data.attempts++;
  data.lastAttempt = Date.now();

  // Lock out if max attempts reached
  if (data.attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
    data.lockedUntil = Date.now() + (CONFIG.LOCKOUT_DURATION * 1000);
  }

  await kv.put(key, JSON.stringify(data), {
    expirationTtl: CONFIG.LOCKOUT_DURATION,
  });
}

/**
 * Clear rate limit for IP (successful login)
 * @param {string} ip - Client IP address
 * @param {KVNamespace} kv - Cloudflare KV namespace
 */
async function clearRateLimit(ip, kv) {
  await kv.delete(`ratelimit:${ip}`);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Create authenticated session
 * @param {string} ip - Client IP address
 * @param {string} project - Project slug
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @param {Object} CONFIG - Configuration object
 * @returns {Promise<string>} Session token
 */
async function createSession(ip, project, kv, CONFIG) {
  const sessionToken = await generateSecureToken();
  const sessionData = {
    ip,
    project,
    createdAt: Date.now(),
    expiresAt: Date.now() + (CONFIG.SESSION_DURATION * 1000),
  };

  await kv.put(
    `session:${sessionToken}`,
    JSON.stringify(sessionData),
    { expirationTtl: CONFIG.SESSION_DURATION }
  );

  return sessionToken;
}

/**
 * Get session data
 * @param {string} token - Session token
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @returns {Promise<Object|null>} Session data or null
 */
async function getSessionData(token, kv) {
  if (!token) return null;

  const sessionData = await kv.get(`session:${token}`, 'json');

  if (!sessionData) return null;

  const now = Date.now();

  // Check expiration
  if (sessionData.expiresAt < now) {
    await kv.delete(`session:${token}`);
    return null;
  }

  return sessionData;
}

/**
 * Verify session token
 * @param {string} token - Session token
 * @param {string} ip - Client IP address
 * @param {KVNamespace} kv - Cloudflare KV namespace
 * @returns {Promise<boolean>} True if session is valid
 */
async function verifySession(token, ip, kv) {
  if (!token) return false;

  const sessionData = await kv.get(`session:${token}`, 'json');

  if (!sessionData) return false;

  const now = Date.now();

  // Check expiration
  if (sessionData.expiresAt < now) {
    await kv.delete(`session:${token}`);
    return false;
  }

  // Verify IP matches (prevent session hijacking)
  if (sessionData.ip !== ip) {
    await kv.delete(`session:${token}`);
    return false;
  }

  return true;
}

/**
 * Destroy session
 * @param {string} token - Session token
 * @param {KVNamespace} kv - Cloudflare KV namespace
 */
async function destroySession(token, kv) {
  await kv.delete(`session:${token}`);
}

// ============================================
// HTTP HELPERS
// ============================================

/**
 * Get cookie value from request
 * @param {Request} request - Request object
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value
 */
function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  return cookies[name] || null;
}

/**
 * Create secure cookie header
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} CONFIG - Configuration object
 * @param {number} maxAge - Max age in seconds (0 to delete)
 * @returns {string} Set-Cookie header value
 */
function createSecureCookie(name, value, CONFIG, maxAge = null) {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
  ];

  const cookieMaxAge = maxAge !== null ? maxAge : CONFIG.SESSION_DURATION;

  if (cookieMaxAge > 0) {
    parts.push(`Max-Age=${cookieMaxAge}`);
  } else {
    parts.push('Max-Age=0');
  }

  if (CONFIG.COOKIE_DOMAIN) {
    parts.push(`Domain=${CONFIG.COOKIE_DOMAIN}`);
  }

  return parts.join('; ');
}

/**
 * Add security headers to response
 * @param {Response} response - Response object
 * @param {Object} CONFIG - Configuration object
 * @returns {Response} Response with security headers
 */
function addSecurityHeaders(response, CONFIG) {
  const headers = new Headers(response.headers);

  Object.entries(CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Get client IP address
 * @param {Request} request - Request object
 * @returns {string} IP address
 */
function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
         'unknown';
}

/**
 * Proxy request to origin server
 * @param {Request} request - Request object
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>} Response from origin
 */
async function proxyToOrigin(request, env) {
  const isDevelopment = env.ENVIRONMENT === 'development';

  if (isDevelopment) {
    // In development, proxy to local dev server
    const url = new URL(request.url);
    const devOriginUrl = env.DEV_ORIGIN_URL || 'http://localhost:3000';
    const originUrl = `${devOriginUrl}${url.pathname}${url.search}`;

    return fetch(originUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // In production, fetch from the actual origin
  return fetch(request);
}

// ============================================
// LOGIN PAGE
// ============================================

const LOGIN_HTML = `
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
        <h1>🔒 Protected Access</h1>
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
            🔐 Secured by Cloudflare Workers
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
    </script>
</body>
</html>
`;

/**
 * Generate project-specific login HTML
 * @param {string} projectSlug - Project slug
 * @returns {string} Login HTML with project context
 */
function generateLoginHTML(projectSlug) {
  const project = PORTFOLIO_DATA[projectSlug];
  const projectName = project ? project.company : 'Portfolio';

  return LOGIN_HTML.replace(
    '<p class="subtitle">Enter password to view work samples</p>',
    `<p class="subtitle">Enter password to view ${projectName} portfolio</p>`
  ).replace(
    'const response = await fetch(\'/auth/login\',',
    `const response = await fetch('/auth/login?project=${projectSlug}',`
  );
}

// ============================================
// MAIN WORKER
// ============================================

export default {
  async fetch(request, env) {
    // Initialize configuration from environment variables
    const CONFIG = getConfig(env);

    const url = new URL(request.url);
    const clientIP = getClientIP(request);
    const isDevelopment = env.ENVIRONMENT === 'development';

    // Enforce HTTPS (skip in development)
    if (url.protocol !== 'https:' && !isDevelopment) {
      return Response.redirect(
        `https://${url.hostname}${url.pathname}${url.search}`,
        301
      );
    }

    // Handle login endpoint
    if (url.pathname === '/auth/login' && request.method === 'POST') {
      return handleLogin(request, env, clientIP, CONFIG);
    }

    // Handle logout endpoint
    if (url.pathname === '/auth/logout') {
      return handleLogout(request, env, CONFIG);
    }

    // Check if this is a portfolio page request
    const portfolioMatch = url.pathname.match(/^\/portfolio\/([^/]+)\/?$/);
    if (portfolioMatch) {
      const projectSlug = portfolioMatch[1];

      // Verify project exists
      if (!CONFIG.PORTFOLIO_PROJECTS[projectSlug]) {
        return new Response('Project not found', { status: 404 });
      }

      // Check authentication for this specific project
      const sessionToken = getCookie(request, CONFIG.COOKIE_NAME);
      const session = await getSessionData(sessionToken, env.KV);
      const isAuthenticated = session && session.project === projectSlug && session.ip === clientIP;

      if (isAuthenticated) {
        // Generate and serve portfolio page
        const portfolioHTML = generatePortfolioHTML(projectSlug);
        return addSecurityHeaders(
          new Response(portfolioHTML, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=UTF-8',
              'Cache-Control': 'private, no-store, no-cache, must-revalidate',
            },
          }),
          CONFIG
        );
      }

      // Show login page with project context
      const loginHTML = generateLoginHTML(projectSlug);
      return addSecurityHeaders(
        new Response(loginHTML, {
          status: 401,
          headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          },
        }),
        CONFIG
      );
    }

    // Check if path requires authentication
    const requiresAuth = CONFIG.PROTECTED_PATHS.some(path =>
      url.pathname.startsWith(path)
    );

    if (!requiresAuth) {
      return addSecurityHeaders(await proxyToOrigin(request, env), CONFIG);
    }

    // For other protected paths, show generic login
    return addSecurityHeaders(
      new Response(LOGIN_HTML, {
        status: 401,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        },
      }),
      CONFIG
    );
  },
};

/**
 * Handle login request
 */
async function handleLogin(request, env, clientIP, CONFIG) {
  // Get project from query parameter
  const url = new URL(request.url);
  const projectSlug = url.searchParams.get('project');

  if (!projectSlug || !CONFIG.PORTFOLIO_PROJECTS[projectSlug]) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid project' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(clientIP, env.KV, CONFIG);

  if (rateLimit.limited || rateLimit.locked) {
    return new Response(
      JSON.stringify({
        success: false,
        message: rateLimit.locked
          ? `Too many failed attempts. Locked for ${rateLimit.remainingSeconds} seconds.`
          : 'Too many failed attempts. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimit.remainingSeconds || CONFIG.LOCKOUT_DURATION,
        },
      }
    );
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { password } = body;

  // Validate password
  if (!password || password.length < CONFIG.PASSWORD_MIN_LENGTH) {
    await recordFailedAttempt(clientIP, env.KV, CONFIG);
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid password' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get project-specific password hash
  const passwordHashKey = CONFIG.PORTFOLIO_PROJECTS[projectSlug];
  const storedPasswordHash = env[passwordHashKey];

  if (!storedPasswordHash) {
    return new Response(
      JSON.stringify({ success: false, message: 'Configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verify password
  const isValid = await verifyPassword(password, storedPasswordHash);

  if (!isValid) {
    await recordFailedAttempt(clientIP, env.KV, CONFIG);
    const remaining = CONFIG.MAX_LOGIN_ATTEMPTS - (rateLimit.attempts + 1);

    return new Response(
      JSON.stringify({
        success: false,
        message: remaining > 0
          ? `Invalid password. ${remaining} attempts remaining.`
          : 'Too many failed attempts.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create session with project context
  await clearRateLimit(clientIP, env.KV);
  const sessionToken = await createSession(clientIP, projectSlug, env.KV, CONFIG);

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createSecureCookie(CONFIG.COOKIE_NAME, sessionToken, CONFIG),
      },
    }
  );
}

/**
 * Handle logout request
 */
async function handleLogout(request, env, CONFIG) {
  const sessionToken = getCookie(request, CONFIG.COOKIE_NAME);

  if (sessionToken) {
    await destroySession(sessionToken, env.KV);
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': createSecureCookie(CONFIG.COOKIE_NAME, '', CONFIG, 0),
    },
  });
}
