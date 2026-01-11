#!/usr/bin/env node

/**
 * Brand UI - Vanilla Build Script
 * Bundles CSS and JS files for distribution
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ============================================
// CONFIGURATION
// ============================================

const CSS_FILES = [
  'vanilla/css/fonts.css',
  'vanilla/css/tokens.css',
  'vanilla/css/base.css',
  'vanilla/css/utilities.css',
];

const JS_FILES = [
  'vanilla/js/core.js',
];

const OUTPUT_DIR = 'dist';
const RELEASE_DIR = 'release';
const FONTS_DIR = 'vanilla/examples/fonts';

// ============================================
// UTILITIES
// ============================================

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readFile(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function writeFile(path, content) {
  writeFileSync(join(ROOT, path), content, 'utf8');
  console.log(`  ✓ ${path}`);
}

function getComponentFiles(dir, ext) {
  const fullPath = join(ROOT, dir);
  if (!existsSync(fullPath)) return [];

  return readdirSync(fullPath)
    .filter(f => f.endsWith(ext))
    .map(f => `${dir}/${f}`);
}

function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around selectors and braces
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
}

function minifyJS(js) {
  // Basic minification (for production, use terser or similar)
  return js
    // Remove single-line comments (but not URLs)
    .replace(/(?<!:)\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around operators
    .replace(/\s*([{}();,:<>=+\-*\/&|!?])\s*/g, '$1')
    .trim();
}

// ============================================
// BUILD FUNCTIONS
// ============================================

function buildCSS() {
  console.log('\nBuilding CSS...');

  // Get all CSS files including components
  const componentFiles = getComponentFiles('vanilla/css/components', '.css');
  const allFiles = [...CSS_FILES, ...componentFiles];

  // Bundle
  const banner = `/**
 * Brand UI v1.0.0
 * Vanilla CSS Component Library
 * https://github.com/your-repo/brand-ui
 */\n\n`;

  let bundle = banner;

  for (const file of allFiles) {
    try {
      const content = readFile(file);
      bundle += `/* === ${file} === */\n${content}\n\n`;
    } catch (e) {
      console.log(`  ⚠ Skipping ${file} (not found)`);
    }
  }

  // Fix font paths for standalone use (../fonts/ -> ./fonts/)
  bundle = bundle.replace(/url\(['"]?\.\.\/fonts\//g, "url('./fonts/");

  // Write bundle
  writeFile(`${OUTPUT_DIR}/brand-ui.css`, bundle);

  // Write minified
  writeFile(`${OUTPUT_DIR}/brand-ui.min.css`, minifyCSS(bundle));

  return bundle;
}

function buildJS() {
  console.log('\nBuilding JavaScript...');

  // Get all JS files including components
  const componentFiles = getComponentFiles('vanilla/js/components', '.js');
  const allFiles = [...JS_FILES, ...componentFiles];

  // Bundle
  const banner = `/**
 * Brand UI v1.0.0
 * Vanilla JavaScript Component Library
 * https://github.com/your-repo/brand-ui
 */\n\n`;

  let bundle = banner;

  for (const file of allFiles) {
    try {
      const content = readFile(file);
      bundle += `/* === ${file} === */\n${content}\n\n`;
    } catch (e) {
      console.log(`  ⚠ Skipping ${file} (not found)`);
    }
  }

  // Write bundle
  writeFile(`${OUTPUT_DIR}/brand-ui.js`, bundle);

  // Write minified
  writeFile(`${OUTPUT_DIR}/brand-ui.min.js`, minifyJS(bundle));

  // Write UMD wrapper
  const umd = `(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BrandUI = factory());
})(this, (function() {
  'use strict';
  ${bundle}
  return BrandUI;
}));`;

  writeFile(`${OUTPUT_DIR}/brand-ui.umd.js`, umd);

  return bundle;
}

function buildRelease() {
  console.log('\nBuilding release package...');

  // Create release directories
  const releaseDir = join(ROOT, RELEASE_DIR);
  const fontsDest = join(releaseDir, 'fonts');
  ensureDir(releaseDir);
  ensureDir(fontsDest);

  // Copy minified files
  copyFileSync(join(ROOT, OUTPUT_DIR, 'brand-ui.min.css'), join(releaseDir, 'brand-ui.min.css'));
  console.log(`  ✓ ${RELEASE_DIR}/brand-ui.min.css`);

  copyFileSync(join(ROOT, OUTPUT_DIR, 'brand-ui.min.js'), join(releaseDir, 'brand-ui.min.js'));
  console.log(`  ✓ ${RELEASE_DIR}/brand-ui.min.js`);

  // Copy fonts
  const fontsSource = join(ROOT, FONTS_DIR);
  if (existsSync(fontsSource)) {
    const fontFiles = readdirSync(fontsSource).filter(f => f.endsWith('.woff2'));
    for (const font of fontFiles) {
      copyFileSync(join(fontsSource, font), join(fontsDest, font));
      console.log(`  ✓ ${RELEASE_DIR}/fonts/${font}`);
    }
  }
}

// ============================================
// MAIN
// ============================================

console.log('Brand UI Build');
console.log('==============');

// Ensure output directory exists
ensureDir(join(ROOT, OUTPUT_DIR));

// Build
buildCSS();
buildJS();
buildRelease();

console.log('\nBuild complete!');
console.log('\nOutput:');
console.log('  dist/     - Full bundle (CSS, JS, UMD)');
console.log('  release/  - Ready to copy (minified + fonts)');
console.log('\nUsage:');
console.log('  <link rel="stylesheet" href="brand-ui.min.css">');
console.log('  <script src="brand-ui.min.js"></script>');
