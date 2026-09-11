# Cloudflare Media Worker (`media-worker`)

High-performance streaming Cloudflare Worker acting as a CDN edge proxy for audio assets and metadata hosted in Cloudflare R2.

## Features
- **HTTP Byte-Range Requests**: Returns `206 Partial Content` with `Content-Range` and `Accept-Ranges: bytes` for scrubbable audio seeking in `<audio>` elements.
- **Cache Optimization**: Emits immutable caching headers for media assets and revalidation headers for JSON metadata with `ETag` / `304 Not Modified` support.
- **CORS Support**: Whitelisted streaming headers and automatic `OPTIONS` preflight handling.
- **Path Traversal Protection**: Rejects `..` sequences and sanitizes URI path inputs.

## Setup & Deployment Instructions

### 1. Create the R2 Bucket
```bash
npx wrangler r2 bucket create <your-r2-bucket-name>
```

### 2. Upload Media Assets
From the repository root:
```bash
# Preview files to upload
node scripts/upload-audio-r2.js --dry-run

# Upload to R2 (requires Wrangler logged in or R2 credentials in .env)
node scripts/upload-audio-r2.js
```

### 3. Test the Worker Locally
```bash
cd audio-worker
npx wrangler dev
```

### 4. Deploy to Cloudflare
```bash
cd audio-worker
npx wrangler deploy
```

Once deployed, route your media subdomain (e.g. `media.example.com`) to the worker or connect your custom domain in the Cloudflare Dashboard under Worker Settings > Triggers > Custom Domains.
