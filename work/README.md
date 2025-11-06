# Portfolio Authentication Worker

Production-ready password protection for individual portfolio projects using Cloudflare Workers.

## Overview

This Cloudflare Worker provides enterprise-grade authentication for portfolio projects, with each project having its own unique password and protected page. Built with modern security best practices and zero hardcoded values.

## Features

**Security:**
- ✅ Project-specific password authentication
- ✅ SHA-256 password hashing
- ✅ Timing-safe password comparison
- ✅ Rate limiting (5 attempts max)
- ✅ IP-based lockouts (15 minutes)
- ✅ Session management with Cloudflare KV
- ✅ Secure cookies (HttpOnly, Secure, SameSite=Strict)
- ✅ Session hijacking protection (IP binding)
- ✅ Security headers (HSTS, XSS, Frame Denial)
- ✅ HTTPS enforcement

**Configuration:**
- ✅ Zero hardcoded values
- ✅ Environment-based configuration
- ✅ Separate dev/production settings
- ✅ Cloudflare secrets for password hashes

## Quick Start (Local Development)

### Prerequisites
- Node.js installed
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account (free tier)

### Setup

1. **Navigate to work directory:**
   ```bash
   cd work
   ```

2. **Install Wrangler (if not already installed):**
   ```bash
   npm install -g wrangler
   ```

3. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

4. **Create preview KV namespace for local development:**
   ```bash
   wrangler kv namespace create "KV" --preview
   ```
   Copy the `preview_id` and update `wrangler.toml` if needed.

5. **Start local development server:**
   ```bash
   wrangler dev --port 8787
   ```

6. **Start your portfolio site (in another terminal):**
   ```bash
   cd ..  # Navigate to project root
   npm start  # Runs on http://localhost:3000
   ```

7. **Test the authentication:**
   - Visit: http://127.0.0.1:8787/
   - Click any company button to see popover
   - Click "View Portfolio →" to access login page
   - Use project passwords from `PORTFOLIO_PASSWORDS.md` (local file, not in git)

## Architecture

### Files

- **`secure-worker.js`** - Main authentication worker
- **`wrangler.toml`** - Cloudflare Worker configuration
- **`hash-password.js`** - Password hash generator utility
- **`.dev.vars`** - Development environment variables (NOT committed)
- **`.env.example`** - Environment variable template

### Documentation

- **`PORTFOLIO_PASSWORDS.md`** - Quick reference for all project passwords
- **`PRODUCTION_SETUP.md`** - Complete production deployment guide

### Environment Configuration

All configuration is managed through environment variables:

**Development:** `.dev.vars` file (local development)
**Production:** Cloudflare secrets and environment variables

See `.env.example` for complete list of required variables.

## Portfolio Projects

Each project has its own password-protected page:

- Corteva (`/portfolio/corteva`)
- Microsoft (`/portfolio/microsoft`)
- Bank of America (`/portfolio/bank-of-america`)
- Royal Caribbean (`/portfolio/royal-caribbean`)
- Weber Shandwick (`/portfolio/weber-shandwick`)
- Macmillan (`/portfolio/macmillan`)
- Guardian (`/portfolio/guardian`)
- SBE (`/portfolio/sbe`)

**Passwords:** See `PORTFOLIO_PASSWORDS.md` for access credentials (not committed to git).

## Configuration

All settings are managed through environment variables. No hardcoded values exist in the codebase.

**Key Environment Variables:**
- `ENVIRONMENT` - Development or production mode
- `SESSION_DURATION` - Session expiration time (seconds)
- `MAX_LOGIN_ATTEMPTS` - Failed attempts before lockout
- `LOCKOUT_DURATION` - Lockout duration (seconds)
- `PASSWORD_HASH_*` - Password hashes for each project
- `DEV_ORIGIN_URL` - Local development server URL
- `PRODUCTION_DOMAIN` - Production domain name

See `.env.example` for complete configuration template.

## Production Deployment

See `PRODUCTION_SETUP.md` for complete production deployment instructions, including:

- Setting environment variables
- Configuring Cloudflare secrets
- Deploying the worker
- Monitoring and troubleshooting

## Monitoring

### Real-time Logs
```bash
wrangler tail
```

### Filter by Status
```bash
# Authentication failures
wrangler tail --status 401

# Server errors
wrangler tail --status 500
```

### View Deployments
```bash
wrangler deployments list
```

## Troubleshooting

### "Configuration error" on login
- Ensure all `PASSWORD_HASH_*` secrets are set in Cloudflare
- Verify environment variables are loaded
- Restart `wrangler dev` after changing `.dev.vars`

### Worker not loading
- Check KV namespace `preview_id` in `wrangler.toml`
- Verify wrangler is running: `wrangler dev --port 8787`
- Check logs: `wrangler tail`

### "Too many attempts" lockout
- Wait 15 minutes for automatic unlock
- Or manually clear: `wrangler kv:key delete "ratelimit:YOUR_IP" --binding KV`

### Changes not reflecting
- Restart `wrangler dev` to reload `.dev.vars`
- Clear browser cookies
- Check browser console for errors

## Security Best Practices

### DO:
- ✅ Use strong, unique passwords for each project
- ✅ Store password hashes as Cloudflare secrets
- ✅ Keep `.dev.vars` in `.gitignore`
- ✅ Rotate passwords periodically
- ✅ Monitor failed login attempts
- ✅ Enable 2FA on Cloudflare account

### DON'T:
- ❌ Commit `.dev.vars` or `.env*` files to git
- ❌ Hardcode passwords or hashes in code
- ❌ Share passwords via insecure channels
- ❌ Use the same password across projects
- ❌ Deploy without setting required secrets

## Cost

**Cloudflare Free Tier includes:**
- 100,000 requests/day
- 1 GB KV storage
- 100,000 KV reads/day
- 1,000 KV writes/day

**Typical portfolio usage:** ~1,000 requests/day = **$0/month**

## Resources

- **Production Setup:** `PRODUCTION_SETUP.md`
- **Password Reference:** `PORTFOLIO_PASSWORDS.md`
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **KV Storage:** https://developers.cloudflare.com/kv/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Security Guide:** https://developers.cloudflare.com/workers/platform/security/

## Support

For issues or questions:
1. Check `PRODUCTION_SETUP.md` troubleshooting section
2. Review Cloudflare Workers documentation
3. Check Cloudflare Community Forum
4. Join Cloudflare Discord

---

**Ready to deploy to production?** See `PRODUCTION_SETUP.md` for complete instructions.
