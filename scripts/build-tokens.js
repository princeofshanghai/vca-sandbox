#!/usr/bin/env node

/**
 * Build Tokens Script
 * 
 * Parses tokens3.json and resolves all color token references
 * from primitives to semantic tokens, then outputs Tailwind-compatible config.
 * 
 * Usage: node scripts/build-tokens.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const TOKENS_FILE = path.join(__dirname, '../docs/tokens3.json');
const OUTPUT_FILE = path.join(__dirname, '../src/design-tokens.js');

/**
 * Convert hex color from tokens (with alpha) to standard hex
 * Example: #0a66c2ff -> #0a66c2
 */
const normalizeHex = (hex) => {
  if (!hex || typeof hex !== 'string') return hex;
  // Remove 'ff' alpha channel if it's fully opaque
  if (hex.length === 9 && hex.endsWith('ff')) {
    return hex.slice(0, 7);
  }
  return hex;
};

/**
 * Resolve a token reference like {color.blue.blue-70} to its actual value
 */
const resolveReference = (value, primitives) => {
  if (typeof value !== 'string' || !value.startsWith('{')) {
    return value;
  }

  // Extract path from {color.blue.blue-70}
  const path = value.slice(1, -1).split('.');
  
  let current = primitives;
  for (const key of path) {
    if (!current || !current[key]) {
      console.warn(`Warning: Could not resolve reference: ${value}`);
      return value;
    }
    current = current[key];
  }

  // Get the actual value
  if (current && typeof current === 'object' && 'value' in current) {
    return normalizeHex(current.value);
  }

  return current;
};

/**
 * Recursively resolve all references in an object
 */
const resolveAllReferences = (obj, primitives, maxDepth = 5, currentDepth = 0) => {
  if (currentDepth > maxDepth) {
    console.warn('Max recursion depth reached');
    return obj;
  }

  if (typeof obj === 'string') {
    return resolveReference(obj, primitives);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveAllReferences(item, primitives, maxDepth, currentDepth + 1));
  }

  if (typeof obj === 'object' && obj !== null) {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'value' && typeof value === 'string') {
        // This is a token value, resolve it
        resolved[key] = resolveReference(value, primitives);
      } else if (typeof value === 'object') {
        resolved[key] = resolveAllReferences(value, primitives, maxDepth, currentDepth + 1);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  return obj;
};

/**
 * Build VCA spacing structure from semantic tokens
 * Also builds metadata with references for documentation
 */
const buildVcaSpacing = (semanticTokens, resolvedTokens) => {
  const vcaSpacing = {};
  const vcaSpacingMeta = {};

  if (!semanticTokens.spacing || !resolvedTokens.spacing) {
    return { spacing: vcaSpacing, meta: vcaSpacingMeta };
  }

  const spacingTokens = semanticTokens.spacing;
  const resolvedSpacingTokens = resolvedTokens.spacing;

  for (const [tokenName, tokenData] of Object.entries(spacingTokens)) {
    if (tokenData && typeof tokenData === 'object' && 'value' in tokenData) {
      // Convert spacing-xs to vca-xs
      const vcaName = `vca-${tokenName.replace('spacing-', '')}`;
      const resolvedValue = resolvedSpacingTokens[tokenName]?.value;
      const originalReference = tokenData.value;

      vcaSpacing[vcaName] = `${resolvedValue}px`;
      vcaSpacingMeta[vcaName] = {
        value: resolvedValue,
        unit: 'px',
        ref: originalReference,
      };
    }
  }

  return { spacing: vcaSpacing, meta: vcaSpacingMeta };
};

/**
 * Build VCA radius structure from semantic tokens
 * Also builds metadata with references for documentation
 */
const buildVcaRadius = (semanticTokens, resolvedTokens) => {
  const vcaRadius = {};
  const vcaRadiusMeta = {};

  if (!semanticTokens.radius || !resolvedTokens.radius) {
    return { radius: vcaRadius, meta: vcaRadiusMeta };
  }

  const radiusTokens = semanticTokens.radius;
  const resolvedRadiusTokens = resolvedTokens.radius;

  for (const [tokenName, tokenData] of Object.entries(radiusTokens)) {
    if (tokenData && typeof tokenData === 'object' && 'value' in tokenData) {
      // Convert radius-xs to vca-xs
      const vcaName = `vca-${tokenName.replace('radius-', '')}`;
      const resolvedValue = resolvedRadiusTokens[tokenName]?.value;
      const originalReference = tokenData.value;

      vcaRadius[vcaName] = `${resolvedValue}px`;
      vcaRadiusMeta[vcaName] = {
        value: resolvedValue,
        unit: 'px',
        ref: originalReference,
      };
    }
  }

  return { radius: vcaRadius, meta: vcaRadiusMeta };
};

/**
 * Build VCA color structure for Tailwind from semantic tokens
 * Also builds metadata with references for documentation
 */
const buildVcaColors = (semanticTokens, resolvedTokens) => {
  const vcaColors = {};
  const vcaColorsMeta = {}; // Store metadata including references

  // Map of category names to their token structure
  const categories = {
    action: 'vca-action',
    text: 'vca-text',
    background: 'vca-background',
    border: 'vca-border',
    surface: 'vca-surface',
    link: 'vca-link',
    icon: 'vca-icon',
    label: 'vca-label',
    positive: 'vca-positive',
    negative: 'vca-negative',
    neutral: 'vca-neutral',
    premium: 'vca-premium',
    brand: 'vca-brand',
    accent: 'vca-accent',
    shadow: 'vca-shadow',
    track: 'vca-track',
  };

  for (const [category, vcaName] of Object.entries(categories)) {
    if (!semanticTokens[category]) continue;

    const categoryTokens = semanticTokens[category];
    const resolvedCategoryTokens = resolvedTokens[category];
    const colorObj = {};
    const metaObj = {};

    // Process each token in the category
    for (const [tokenName, tokenData] of Object.entries(categoryTokens)) {
      if (tokenData && typeof tokenData === 'object' && 'value' in tokenData) {
        // Extract the suffix from color-action-hover -> hover
        // Handle different token naming patterns:
        // 1. Standard: color-action-hover -> hover
        // 2. Special: color-logo-brand (brand category) -> logo-brand
        // 3. Special: color-premium-text-brand (premium category) -> text-brand
        
        let suffix = tokenName
          .replace(`color-${category}-`, '')  // Try standard pattern first
          .replace(`color-${category}`, '');   // Handle exact match (default token)
        
        // If token still starts with "color-", remove it (for special cases like brand)
        if (suffix.startsWith('color-')) {
          suffix = suffix.replace('color-', '');
        }
        
        // Get resolved value and original reference
        const resolvedValue = resolvedCategoryTokens[tokenName]?.value;
        const originalReference = tokenData.value; // Keep original {color.blue.blue-70} format
        
        if (!suffix || suffix === tokenName) {
          // This is the default value (e.g., color-action) or couldn't parse
          // Skip if we couldn't extract a meaningful suffix
          if (suffix === tokenName) {
            // Use a cleaned version as the suffix
            suffix = tokenName.replace(/^color-/, '').replace(new RegExp(`^${category}-?`), '');
          }
          if (!suffix) {
            colorObj.DEFAULT = resolvedValue;
            metaObj.DEFAULT = { value: resolvedValue, ref: originalReference };
          } else {
            colorObj[suffix] = resolvedValue;
            metaObj[suffix] = { value: resolvedValue, ref: originalReference };
          }
        } else {
          // This is a variant (e.g., hover, active)
          colorObj[suffix] = resolvedValue;
          metaObj[suffix] = { value: resolvedValue, ref: originalReference };
        }
      }
    }

    // Store in VCA colors
    if (Object.keys(colorObj).length > 0) {
      vcaColors[vcaName] = colorObj;
      vcaColorsMeta[vcaName] = metaObj;
    }
  }

  // Add special handling for action transparent colors (nested structure)
  if (resolvedTokens.action) {
    // Add action-transparent variants
    if (!vcaColors['vca-action-transparent']) {
      vcaColors['vca-action-transparent'] = {};
      vcaColorsMeta['vca-action-transparent'] = {};
    }
    
    const actionTokens = resolvedTokens.action;
    const actionSemanticTokens = semanticTokens.action;
    
    if (actionTokens['color-background-action-transparent-hover']) {
      const resolvedValue = actionTokens['color-background-action-transparent-hover'].value;
      const originalRef = actionSemanticTokens['color-background-action-transparent-hover']?.value || '';
      
      vcaColors['vca-action-transparent'].hover = resolvedValue;
      vcaColorsMeta['vca-action-transparent'].hover = { value: resolvedValue, ref: originalRef };
      
      // Also add aliases for different naming conventions
      vcaColors['vca-action-background-transparent'] = { hover: resolvedValue };
      vcaColors['vca-background-action-transparent'] = { hover: resolvedValue };
      vcaColorsMeta['vca-action-background-transparent'] = { hover: { value: resolvedValue, ref: originalRef } };
      vcaColorsMeta['vca-background-action-transparent'] = { hover: { value: resolvedValue, ref: originalRef } };
    }
    
    if (actionTokens['color-background-action-transparent-active']) {
      const resolvedValue = actionTokens['color-background-action-transparent-active'].value;
      const originalRef = actionSemanticTokens['color-background-action-transparent-active']?.value || '';
      
      vcaColors['vca-action-transparent'].active = resolvedValue;
      vcaColorsMeta['vca-action-transparent'].active = { value: resolvedValue, ref: originalRef };
      
      vcaColors['vca-action-background-transparent'].active = resolvedValue;
      vcaColors['vca-background-action-transparent'].active = resolvedValue;
      vcaColorsMeta['vca-action-background-transparent'].active = { value: resolvedValue, ref: originalRef };
      vcaColorsMeta['vca-background-action-transparent'].active = { value: resolvedValue, ref: originalRef };
    }
  }

  // Handle special single-value tokens
  if (resolvedTokens.track && resolvedTokens.track['color-track']) {
    const resolvedValue = resolvedTokens.track['color-track'].value;
    const originalRef = semanticTokens.track?.['color-track']?.value || '';
    vcaColors['vca-track'] = resolvedValue;
    vcaColorsMeta['vca-track'] = { value: resolvedValue, ref: originalRef };
  }

  if (resolvedTokens.shadow) {
    const shadowResolved = resolvedTokens.shadow['color-shadow']?.value || '#0000004c';
    const shadowSupplementalResolved = resolvedTokens.shadow['color-shadow-supplemental']?.value || '#8c8c8c33';
    const shadowRef = semanticTokens.shadow?.['color-shadow']?.value || '';
    const shadowSupplementalRef = semanticTokens.shadow?.['color-shadow-supplemental']?.value || '';
    
    vcaColors['vca-shadow'] = shadowResolved;
    vcaColors['vca-shadow-supplemental'] = shadowSupplementalResolved;
    vcaColorsMeta['vca-shadow'] = { value: shadowResolved, ref: shadowRef };
    vcaColorsMeta['vca-shadow-supplemental'] = { value: shadowSupplementalResolved, ref: shadowSupplementalRef };
  }

  // Add white and spec-orange (if they exist in primitives)
  vcaColors['vca-white'] = '#ffffff';
  vcaColors['vca-spec-orange'] = '#ED4400';
  vcaColorsMeta['vca-white'] = { value: '#ffffff', ref: '{color.white.white-100}' };
  vcaColorsMeta['vca-spec-orange'] = { value: '#ED4400', ref: '{color.spec-orange}' };

  return { colors: vcaColors, meta: vcaColorsMeta };
};

/**
 * Main build function
 */
const buildTokens = () => {
  console.log('🎨 Building design tokens...\n');

  // Read tokens file
  console.log(`📖 Reading ${TOKENS_FILE}...`);
  const tokensData = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));

  // Extract primitives and semantic tokens
  const primitives = tokensData['primitives-mode-1'];
  const semanticTokens = tokensData['tokens-mode-1'];

  if (!primitives || !semanticTokens) {
    throw new Error('Invalid tokens file structure. Expected "primitives-mode-1" and "tokens-mode-1"');
  }

  console.log('✅ Loaded primitives and semantic tokens\n');

  // Resolve all references in semantic tokens
  console.log('🔗 Resolving token references...');
  const resolvedTokens = resolveAllReferences(semanticTokens, primitives);
  console.log('✅ All references resolved\n');

  // Build VCA color structure
  console.log('🎨 Building VCA color tokens...');
  const { colors: vcaColors, meta: vcaColorsMeta } = buildVcaColors(semanticTokens, resolvedTokens);
  console.log(`✅ Generated ${Object.keys(vcaColors).length} VCA color categories\n`);

  // Build VCA spacing structure
  console.log('📏 Building VCA spacing tokens...');
  const { spacing: vcaSpacing, meta: vcaSpacingMeta } = buildVcaSpacing(semanticTokens, resolvedTokens);
  console.log(`✅ Generated ${Object.keys(vcaSpacing).length} VCA spacing tokens\n`);

  // Build VCA radius structure
  console.log('⭕ Building VCA radius tokens...');
  const { radius: vcaRadius, meta: vcaRadiusMeta } = buildVcaRadius(semanticTokens, resolvedTokens);
  console.log(`✅ Generated ${Object.keys(vcaRadius).length} VCA radius tokens\n`);

  // Generate output file
  console.log(`💾 Writing to ${OUTPUT_FILE}...`);
  const output = `/**
 * VCA Design Tokens
 * 
 * Auto-generated from tokens3.json
 * DO NOT EDIT THIS FILE MANUALLY
 * 
 * To regenerate: npm run build:tokens
 */

export const vcaColors = ${JSON.stringify(vcaColors, null, 2)};

export const vcaColorsMeta = ${JSON.stringify(vcaColorsMeta, null, 2)};

export const vcaSpacing = ${JSON.stringify(vcaSpacing, null, 2)};

export const vcaSpacingMeta = ${JSON.stringify(vcaSpacingMeta, null, 2)};

export const vcaRadius = ${JSON.stringify(vcaRadius, null, 2)};

export const vcaRadiusMeta = ${JSON.stringify(vcaRadiusMeta, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log('✅ Design tokens generated successfully!\n');

  // Summary
  console.log('📊 Summary:');
  console.log(`   - VCA Color Categories: ${Object.keys(vcaColors).length}`);
  console.log(`   - Total Color Tokens: ${Object.values(vcaColors).reduce((acc, cat) => {
    if (typeof cat === 'string') return acc + 1;
    return acc + Object.keys(cat).length;
  }, 0)}`);
  console.log(`   - VCA Spacing Tokens: ${Object.keys(vcaSpacing).length}`);
  console.log(`   - VCA Radius Tokens: ${Object.keys(vcaRadius).length}`);
  console.log('\n✨ Done! Import from: src/design-tokens.js');
};

// Run the build
try {
  buildTokens();
} catch (error) {
  console.error('❌ Error building tokens:', error.message);
  process.exit(1);
}

