#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if TypeScript is installed
const tscPath = path.join(__dirname, '../node_modules/typescript/bin/tsc');

if (!fs.existsSync(tscPath)) {
  console.log('📦 TypeScript not found, installing dependencies...');
  try {
    execSync('npm install --no-bin-links', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Run TypeScript compiler
console.log('🔨 Building TypeScript...');
try {
  execSync('node node_modules/typescript/bin/tsc', { stdio: 'inherit' });
  console.log('✅ Build complete!');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}
