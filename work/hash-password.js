#!/usr/bin/env node

/**
 * Password Hash Generator for Cloudflare Worker
 *
 * Usage:
 *   node hash-password.js your-password
 *
 * This generates a SHA-256 hash that you'll set as the PASSWORD_HASH secret
 */

const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('\nUsage:');
  console.log('  node hash-password.js your-password');
  console.log('\nExample:');
  console.log('  node hash-password.js MySecurePassword123!');
  process.exit(1);
}

// Validate password strength
const minLength = 12;
const hasUppercase = /[A-Z]/.test(password);
const hasLowercase = /[a-z]/.test(password);
const hasNumber = /[0-9]/.test(password);
const hasSpecial = /[^A-Za-z0-9]/.test(password);

console.log('\n🔐 Password Strength Check:');
console.log('─────────────────────────────');

if (password.length < minLength) {
  console.log(`⚠️  Length: ${password.length} characters (minimum ${minLength} recommended)`);
} else {
  console.log(`✅ Length: ${password.length} characters`);
}

console.log(hasUppercase ? '✅ Contains uppercase letters' : '⚠️  Missing uppercase letters');
console.log(hasLowercase ? '✅ Contains lowercase letters' : '⚠️  Missing lowercase letters');
console.log(hasNumber ? '✅ Contains numbers' : '⚠️  Missing numbers');
console.log(hasSpecial ? '✅ Contains special characters' : '⚠️  Missing special characters');

const isStrong = password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

if (!isStrong) {
  console.log('\n⚠️  WARNING: Password is weak. Consider using a stronger password.');
}

// Generate hash
const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('\n📝 Generated Hash:');
console.log('─────────────────────────────');
console.log(hash);

console.log('\n📋 Next Steps:');
console.log('─────────────────────────────');
console.log('1. Copy the hash above');
console.log('2. Run: wrangler secret put PASSWORD_HASH');
console.log('3. Paste the hash when prompted');
console.log('4. Deploy: wrangler deploy');

console.log('\n💡 Testing:');
console.log('─────────────────────────────');
console.log('After deployment, test with this password:');
console.log(`  ${password}`);
console.log('\n');
