# Portfolio Password Protected Pages 

## Overview
Each portfolio project now has its own password-protected page accessible from popover links on the homepage.

## Project Passwords (Development & Production)

| Project | Password | URL |
|---------|----------|-----|
| **Corteva** | `Corteva_2025!` | `/portfolio/corteva` |
| **Microsoft** | `Microsoft_2025!` | `/portfolio/microsoft` |
| **Bank of America** | `BankOfAmerica_2025!` | `/portfolio/bank-of-america` |
| **Royal Caribbean** | `RoyalCaribbean_2025!` | `/portfolio/royal-caribbean` |
| **Weber Shandwick** | `WeberShandwick_2025!` | `/portfolio/weber-shandwick` |
| **Macmillan** | `Macmillan_2025!` | `/portfolio/macmillan` |
| **Guardian** | `Guardian_2025!` | `/portfolio/guardian` |
| **SBE** | `SBE_2025!` | `/portfolio/sbe` |

## How It Works

1. **User clicks company button** on homepage → Popover appears
2. **User clicks "View Portfolio →" link** in popover
3. **Login page appears** (project-specific)
4. **User enters password** for that specific project
5. **Portfolio page displays** with placeholder content

## Local Development Setup

### 1. Start your portfolio site:
```bash
cd /Users/robertjames/dev/rjames
npm start  # Runs on http://localhost:3000
```

### 2. Start the Cloudflare Worker (in a new terminal):
```bash
cd /Users/robertjames/dev/rjames/work
wrangler dev --port 8787
```

### 3. Test the setup:
- Visit: `http://127.0.0.1:8787/`
- Click any company button to see the popover
- Click "View Portfolio →" to see the login page
- Enter the password from the table above

## Production Deployment

**See `PRODUCTION_SETUP.md` for complete production deployment instructions.**

Quick summary:

### 1. Configure production environment variables in `wrangler.toml`:

```toml
[env.production.vars]
ENVIRONMENT = "production"
SESSION_DURATION = "3600"
MAX_LOGIN_ATTEMPTS = "5"
LOCKOUT_DURATION = "900"
PASSWORD_MIN_LENGTH = "8"
COOKIE_NAME = "__Secure-auth"
COOKIE_DOMAIN = ".robertjames.nyc"
PRODUCTION_DOMAIN = "robertjames.nyc"
PROTECTED_PATHS = "/portfolio/"
```

### 2. Set password hash secrets:

```bash
cd /Users/robertjames/dev/rjames/work

# Set each project's password hash as a secret
wrangler secret put PASSWORD_HASH_CORTEVA --env production
# Paste: b81af51792e60aeee845e2730969302b577162cdc78804183c84e8ea3c2dd501

# Repeat for all other projects...
# (See PRODUCTION_SETUP.md for complete list)
```

### 3. Deploy the worker:
```bash
wrangler deploy --env production
```

### 4. Verify deployment:
- Visit: `https://robertjames.nyc/portfolio/corteva`
- You should see the login page
- Test with password: `Corteva_2025!`

## Placeholder Content

Each portfolio page currently contains:
- Project header with company name, role, industry, duration
- Challenges section (bulleted list)
- Solutions section (bulleted list)
- Impact/results section (bulleted list)
- Technologies used (tags)
- Placeholder images (gray gradient boxes)

## Updating Portfolio Content

To update portfolio content with real images and details:

1. Edit `/Users/robertjames/dev/rjames/work/secure-worker.js`
2. Find the `PORTFOLIO_DATA` object (starting around line 65)
3. Update the content for each project
4. To add images, update the placeholder div sections in the `generatePortfolioHTML` function (line 252)

## Security Features

✅ Each project has a unique password
✅ Sessions are IP-bound (prevent session hijacking)
✅ Rate limiting (5 attempts max, 15-minute lockout)
✅ Secure cookies (HttpOnly, Secure, SameSite)
✅ Password hashing with SHA-256
✅ Session expiration (1 hour)

## Files Modified

- `/work/secure-worker.js` - Main authentication worker with portfolio routing
- `/work/.dev.vars` - Development environment variables (NOT committed to git)
- `/work/wrangler.toml` - Cloudflare Worker configuration
- `/index.html` - Added "View Portfolio →" links to all popovers
- `/styles/main.css` - Added `.portfolio-link` styling

## Notes

- Each project requires its own password for security
- Sessions are project-specific (accessing Corteva doesn't grant access to Microsoft)
- All placeholder content can be replaced with real content
- Images can be added by updating the HTML generation function
