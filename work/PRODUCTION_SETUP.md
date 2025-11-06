# Production Environment Setup

## Overview
All configuration values are now managed through environment variables. No hardcoded values exist in the codebase. This guide explains how to set up production environment variables for Cloudflare Workers.

## Environment Variables

All configuration is defined in environment variables. See `.env.example` for the complete list of required variables.

### Required Production Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `ENVIRONMENT` | Environment name | `production` |
| `SESSION_DURATION` | Session duration in seconds | `3600` (1 hour) |
| `MAX_LOGIN_ATTEMPTS` | Max failed login attempts | `5` |
| `LOCKOUT_DURATION` | Lockout duration in seconds | `900` (15 minutes) |
| `PASSWORD_MIN_LENGTH` | Minimum password length | `8` |
| `COOKIE_NAME` | Session cookie name | `__Secure-auth` |
| `COOKIE_DOMAIN` | Cookie domain (optional) | `.robertjames.nyc` or empty |
| `DEV_ORIGIN_URL` | Dev server URL | `http://localhost:3000` |
| `PRODUCTION_DOMAIN` | Production domain | `robertjames.nyc` |
| `PROTECTED_PATHS` | Comma-separated protected paths | `/portfolio/` |
| `PASSWORD_HASH_*` | Password hashes for each project | See below |

## Production Deployment Steps

### 1. Set Configuration Variables

Cloudflare Workers uses two types of environment configuration:
- **Variables** - Non-sensitive configuration (via `wrangler.toml` or dashboard)
- **Secrets** - Sensitive data like password hashes (encrypted)

#### Set Non-Sensitive Variables

You can set these in `wrangler.toml` under `[env.production.vars]` or via Cloudflare dashboard:

```bash
# Via Wrangler CLI
wrangler deploy --var ENVIRONMENT:production --var SESSION_DURATION:3600 --var MAX_LOGIN_ATTEMPTS:5 --var LOCKOUT_DURATION:900 --var PASSWORD_MIN_LENGTH:8 --var COOKIE_NAME:__Secure-auth --var COOKIE_DOMAIN:.robertjames.nyc --var PRODUCTION_DOMAIN:robertjames.nyc --var PROTECTED_PATHS:/portfolio/
```

Or add to `wrangler.toml`:

```toml
[env.production.vars]
ENVIRONMENT = "production"
SESSION_DURATION = "3600"
MAX_LOGIN_ATTEMPTS = "5"
LOCKOUT_DURATION = "900"
PASSWORD_MIN_LENGTH = "8"
COOKIE_NAME = "__Secure-auth"
COOKIE_DOMAIN = ".robertjames.nyc"  # Or empty string for same-domain only
PRODUCTION_DOMAIN = "robertjames.nyc"
PROTECTED_PATHS = "/portfolio/"
```

#### Set Secrets (Password Hashes)

**IMPORTANT:** Never commit password hashes to git. Always use Cloudflare secrets.

```bash
# Set each password hash as a secret
wrangler secret put PASSWORD_HASH_CORTEVA --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_MICROSOFT --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_BANK_OF_AMERICA --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_ROYAL_CARIBBEAN --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_WEBER_SHANDWICK --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_MACMILLAN --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_GUARDIAN --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]

wrangler secret put PASSWORD_HASH_SBE --env production
# Paste: [REDACTED_HEX][REDACTED_HEX]
```

### 2. Deploy to Production

```bash
wrangler deploy --env production
```

### 3. Verify Deployment

```bash
# Check deployment status
wrangler deployments list

# View environment variables (secrets will be hidden)
wrangler secret list --env production

# Test the deployment
curl https://robertjames.nyc/portfolio/corteva
# Should show login page
```

## Updating Configuration

### Update Non-Sensitive Variables

Edit `wrangler.toml` and redeploy:

```bash
wrangler deploy --env production
```

### Update Secrets

```bash
# Update a specific password hash
wrangler secret put PASSWORD_HASH_CORTEVA --env production

# List all secrets
wrangler secret list --env production

# Delete a secret
wrangler secret delete PASSWORD_HASH_CORTEVA --env production
```

## Staging Environment (Optional)

You can create a staging environment with different configuration:

```toml
[env.staging]
name = "portfolio-secure-auth-staging"
route = "staging.robertjames.nyc/work/*"

[env.staging.vars]
ENVIRONMENT = "staging"
SESSION_DURATION = "1800"  # 30 minutes for testing
MAX_LOGIN_ATTEMPTS = "10"  # More lenient for testing
# ... other vars
```

Deploy to staging:

```bash
wrangler deploy --env staging
```

## Security Best Practices

### ✅ DO:
- Use Cloudflare secrets for all password hashes
- Use strong, unique passwords for each project
- Rotate passwords periodically
- Keep `.dev.vars` in `.gitignore`
- Use different passwords for dev/staging/production
- Set `COOKIE_DOMAIN` appropriately for your domain

### ❌ DON'T:
- Commit `.dev.vars` or any `.env*` files to git
- Hardcode passwords or hashes in code
- Share passwords via insecure channels
- Use the same password across multiple projects
- Deploy without setting all required secrets

## Troubleshooting

### "Configuration error" on login
- Check that all `PASSWORD_HASH_*` secrets are set:
  ```bash
  wrangler secret list --env production
  ```
- Verify the password hash matches:
  ```bash
  node hash-password.js "YourPassword123!"
  ```

### Environment variables not updating
- Redeploy after changing `wrangler.toml`:
  ```bash
  wrangler deploy --env production
  ```
- For secrets, use `wrangler secret put` (no redeploy needed)

### Session issues
- Check `SESSION_DURATION` is set correctly
- Verify `COOKIE_NAME` and `COOKIE_DOMAIN` settings
- Clear browser cookies and try again

## Monitoring

View real-time logs:

```bash
# Production logs
wrangler tail --env production

# Filter by status code
wrangler tail --env production --status 401

# Search for specific errors
wrangler tail --env production | grep "Configuration error"
```

## Backup Configuration

Document your current production configuration (without secrets):

```bash
# Export non-secret variables from wrangler.toml
cat wrangler.toml | grep -A 20 "\[env.production.vars\]"

# List secret names (values are encrypted)
wrangler secret list --env production
```

## Rolling Back

If something goes wrong:

```bash
# List recent deployments
wrangler deployments list

# Rollback to previous deployment
wrangler rollback [version-id]
```

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Environment Variables Guide](https://developers.cloudflare.com/workers/platform/environment-variables/)
- [Secrets Management](https://developers.cloudflare.com/workers/platform/environment-variables/#secrets)
