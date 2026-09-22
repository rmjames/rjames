#!/usr/bin/env node

/**
 * Design Parity & Component Prop Audit Script
 * Automated verification of:
 * 1. CSS tokens & Baseline 2025 formatting rules against design.md
 * 2. Component props, attributes, and contracts against specs/components/*.spec.json
 *
 * Runs with zero dependencies (pure Node.js standard library).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../../../');
const DESIGN_SPEC_PATH = path.join(ROOT_DIR, 'design.md');
const W3C_TOKENS_PATH = path.join(ROOT_DIR, 'specs/tokens.json');
const VARIABLES_CSS_PATH = path.join(ROOT_DIR, 'styles/base/variables.css');
const STYLES_DIR = path.join(ROOT_DIR, 'styles');
const SPECS_DIR = path.join(ROOT_DIR, 'specs/components');
const HTML_FILES = ['index.html', 'resume.html', 'lab.html', 'pattern-library.html'];

console.log('🎨 Running Design Parity & Component Contract Audit...\n');

const findings = [];

// ============================================================================
// PART 1: Design Tokens vs design.md & W3C specs/tokens.json
// ============================================================================
if (fs.existsSync(VARIABLES_CSS_PATH)) {
  const variablesCssContent = fs.readFileSync(VARIABLES_CSS_PATH, 'utf-8');

  // A. Check tokens from design.md
  if (fs.existsSync(DESIGN_SPEC_PATH)) {
    const designMdContent = fs.readFileSync(DESIGN_SPEC_PATH, 'utf-8');
    const tokenRegex = /\| `(--[a-zA-Z0-9-]+)` \|/g;
    const specTokens = new Set();
    let match;
    while ((match = tokenRegex.exec(designMdContent)) !== null) {
      specTokens.add(match[1]);
    }

    for (const token of specTokens) {
      const tokenDeclRegex = new RegExp(`${token}\\s*:`, 'g');
      if (!tokenDeclRegex.test(variablesCssContent)) {
        findings.push({
          category: 'Token Drift',
          file: 'styles/base/variables.css',
          rule: 'Missing Spec Token in Code',
          detail: `Token '${token}' is specified in design.md but not defined in styles/base/variables.css.`
        });
      }
    }
  }

  // B. Cross-validate against W3C Design Tokens (specs/tokens.json)
  if (fs.existsSync(W3C_TOKENS_PATH)) {
    try {
      const w3c = JSON.parse(fs.readFileSync(W3C_TOKENS_PATH, 'utf-8'));
      function collectTokenNames(obj, prefix = '') {
        const names = [];
        for (const [k, v] of Object.entries(obj)) {
          if (k.startsWith('$')) continue;
          if (v && typeof v === 'object') {
            if (v.$value !== undefined) {
              names.push(`--${k}`);
            } else {
              names.push(...collectTokenNames(v, k));
            }
          }
        }
        return names;
      }
      const tokenNames = collectTokenNames(w3c);
      tokenNames.forEach(token => {
        // Skip semantic aliases with different naming in css
        if (token === '--text-dark' || token === '--text-light' || token === '--default' || token === '--link') return;
        const regex = new RegExp(`${token}\\s*:`, 'g');
        if (!regex.test(variablesCssContent)) {
          findings.push({
            category: 'Token Drift',
            file: 'styles/base/variables.css',
            rule: 'Missing W3C Token in Code',
            detail: `W3C Design Token '${token}' is defined in specs/tokens.json but missing in styles/base/variables.css.`
          });
        }
      });
    } catch (e) {
      console.warn('⚠️ Could not parse specs/tokens.json:', e.message);
    }
  }
}

// ============================================================================
// PART 2: Baseline 2025 Formatting & Logical Properties
// ============================================================================
function checkPrecedingZeros(filePath, content) {
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.includes('http://') || line.includes('https://')) return;
    const floatMatch = line.match(/\b0\.\d+/g);
    if (floatMatch) {
      findings.push({
        category: 'Baseline Rule',
        file: path.relative(ROOT_DIR, filePath),
        line: idx + 1,
        rule: 'Preceding zero on float',
        detail: `Found '${floatMatch.join(', ')}'. AGENTS.md requires removing preceding zeros (e.g. .${floatMatch[0].slice(2)}).`,
        snippet: line.trim()
      });
    }
  });
}

function checkPhysicalProperties(filePath, content) {
  const lines = content.split('\n');
  const physicalProps = [
    { regex: /(?<!-)width\s*:/g, replacement: 'inline-size' },
    { regex: /(?<!-)height\s*:/g, replacement: 'block-size' },
    { regex: /(?<!-)max-width\s*:/g, replacement: 'max-inline-size' },
    { regex: /(?<!-)max-height\s*:/g, replacement: 'max-block-size' },
    { regex: /(?<!-)min-width\s*:/g, replacement: 'min-inline-size' },
    { regex: /(?<!-)min-height\s*:/g, replacement: 'min-block-size' }
  ];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) return;
    physicalProps.forEach(prop => {
      if (prop.regex.test(trimmed)) {
        findings.push({
          category: 'Baseline Rule',
          file: path.relative(ROOT_DIR, filePath),
          line: idx + 1,
          rule: 'Physical property usage',
          detail: `Prefer logical property '${prop.replacement}' over physical property.`,
          snippet: trimmed
        });
      }
    });
  });
}

if (fs.existsSync(STYLES_DIR)) {
  function walkCssFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkCssFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        checkPrecedingZeros(fullPath, content);
        checkPhysicalProperties(fullPath, content);
      }
    }
  }
  walkCssFiles(STYLES_DIR);
}

// ============================================================================
// PART 3: Component Prop Spec Auditing (specs/components/*.spec.json)
// ============================================================================
if (fs.existsSync(SPECS_DIR)) {
  const specFiles = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.json'));
  const componentSpecs = specFiles.map(file => {
    const raw = fs.readFileSync(path.join(SPECS_DIR, file), 'utf-8');
    return { file, ...JSON.parse(raw) };
  });

  // Dynamically include all HTML files referenced in component specs
  const htmlFileSet = new Set(HTML_FILES);
  componentSpecs.forEach(spec => {
    if (Array.isArray(spec.targetFiles)) {
      spec.targetFiles.forEach(f => htmlFileSet.add(f));
    }
  });

  htmlFileSet.forEach(htmlFileName => {
    const htmlPath = path.join(ROOT_DIR, htmlFileName);
    if (!fs.existsSync(htmlPath)) return;
    const content = fs.readFileSync(htmlPath, 'utf-8');

    // Collect all element IDs in this file for reference validation
    const idMatches = content.matchAll(/\bid=["']([^"']+)["']/g);
    const declaredIds = new Set([...idMatches].map(m => m[1]));

    componentSpecs.forEach(spec => {
      if (spec.targetFiles && !spec.targetFiles.includes(htmlFileName)) return;
      // Extract the leaf selector (e.g. "article" from "section.demo-examples article")
      const leafSelector = spec.selector.split(/\s+/).pop();
      const classMatch = leafSelector.match(/\.([a-zA-Z0-9_-]+)/);
      const tagMatch = leafSelector.match(/^([a-z0-9]+)/);

      const targetClass = classMatch ? classMatch[1] : null;
      const targetTag = tagMatch ? tagMatch[1] : (spec.requiredTag || '[a-z0-9]+');

      // Match all opening tags for targetTag
      const tagRegex = new RegExp(`<(${targetTag})\\b([^>]*)>`, 'gi');

      let match;
      while ((match = tagRegex.exec(content)) !== null) {
        const fullTag = match[0];
        const actualTag = match[1].toLowerCase();
        const rawAttrs = match[2];
        const matchIndex = match.index;
        const line = content.substring(0, matchIndex).split('\n').length;

        // Parse attributes into a key-value dictionary
        const attrDict = {};
        const attrMatches = rawAttrs.matchAll(/([a-zA-Z0-9_-]+)(?:=["']([^"']*)["'])?/g);
        for (const attr of attrMatches) {
          attrDict[attr[1].toLowerCase()] = attr[2] !== undefined ? attr[2] : true;
        }

        // If spec requires a specific class, verify element contains it
        if (targetClass) {
          const classList = (attrDict['class'] || '').trim().split(/\s+/);
          if (!classList.includes(targetClass)) {
            continue;
          }
        }

        // 1. Validate required tag
        if (spec.requiredTag) {
          const allowedTags = spec.requiredTag.toLowerCase().split('|');
          if (!allowedTags.includes(actualTag)) {
            findings.push({
              category: 'Component Drift',
              file: htmlFileName,
              line,
              rule: `${spec.name}: Invalid HTML Tag`,
              detail: `Component '${spec.name}' must use <${spec.requiredTag}>, but found <${actualTag}>.`,
              snippet: fullTag
            });
          }
        }

        // 2. Validate required attributes
        if (spec.requiredAttributes) {
          for (const [attrName, pattern] of Object.entries(spec.requiredAttributes)) {
            const val = attrDict[attrName.toLowerCase()];
            if (val === undefined) {
              findings.push({
                category: 'Component Drift',
                file: htmlFileName,
                line,
                rule: `${spec.name}: Missing Required Attribute`,
                detail: `Attribute '${attrName}' is required on '${spec.name}' matching '${pattern}'.`,
                snippet: fullTag
              });
            } else if (typeof val === 'string' && pattern) {
              const regex = new RegExp(pattern);
              if (!regex.test(val)) {
                findings.push({
                  category: 'Component Drift',
                  file: htmlFileName,
                  line,
                  rule: `${spec.name}: Attribute Value Mismatch`,
                  detail: `Attribute '${attrName}="${val}"' does not match required pattern '${pattern}'.`,
                  snippet: fullTag
                });
              }
            }
          }
        }

        // 3. Validate target ID existence (e.g. popovertarget pointing to valid popover)
        if (attrDict['popovertarget']) {
          const targetId = attrDict['popovertarget'];
          if (!declaredIds.has(targetId)) {
            findings.push({
              category: 'Component Drift',
              file: htmlFileName,
              line,
              rule: `${spec.name}: Broken Target Reference`,
              detail: `popovertarget="${targetId}" refers to an element ID that does not exist in ${htmlFileName}.`,
              snippet: fullTag
            });
          }
        }

        // 4. Validate accessibility properties
        if (spec.a11y?.requiresAccessibleName) {
          const hasAriaLabel = !!attrDict['aria-label'] || !!attrDict['aria-labelledby'];
          // For buttons or links, check if there is inner text following the tag
          const nextChunk = content.substring(matchIndex + fullTag.length, matchIndex + fullTag.length + 150);
          const textMatch = nextChunk.match(/^([^<]+)/);
          const hasDirectText = textMatch && textMatch[1].trim().length > 0;

          if (!hasAriaLabel && !hasDirectText && !attrDict['title']) {
            findings.push({
              category: 'A11y Parity',
              file: htmlFileName,
              line,
              rule: `${spec.name}: Missing Accessible Name`,
              detail: `Interactive component '${spec.name}' must have visible text, 'aria-label', or 'aria-labelledby'.`,
              snippet: fullTag
            });
          }
        }
      }
    });
  });
}

// ============================================================================
// Output Findings Summary
// ============================================================================
console.log('='.repeat(70));
console.log(`📊 PARITY & COMPONENT AUDIT REPORT: ${findings.length} findings identified`);
console.log('='.repeat(70));

if (findings.length === 0) {
  console.log('✅ 100% Parity Achieved! All tokens, rules, and component contracts pass.\n');
  process.exit(0);
}

const byCategory = {};
findings.forEach(f => {
  byCategory[f.category] = (byCategory[f.category] || 0) + 1;
});

console.log('Summary by category:');
Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`  • ${cat}: ${count}`);
});
console.log('-'.repeat(70));

// Highlight Component Drift and Token Drift first
const prioritized = [
  ...findings.filter(f => f.category === 'Component Drift' || f.category === 'Token Drift' || f.category === 'A11y Parity'),
  ...findings.filter(f => f.category === 'Baseline Rule')
];

prioritized.slice(0, 20).forEach((f, idx) => {
  console.log(`\n[PARITY-${String(idx + 1).padStart(2, '0')}] ${f.rule} (${f.category})`);
  console.log(`  File: ${f.file}${f.line ? `:${f.line}` : ''}`);
  console.log(`  Detail: ${f.detail}`);
  if (f.snippet) {
    console.log(`  Snippet: ${f.snippet}`);
  }
});

if (findings.length > 20) {
  console.log(`\n... and ${findings.length - 20} more findings (mostly float formatting / logical properties).`);
}

console.log('\n' + '='.repeat(70) + '\n');
