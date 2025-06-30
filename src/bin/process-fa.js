#!/usr/bin/env node

/**
 * @description Converts FontAwesome iconset into standardized format for use with this package.
 * Will create iconsets and dist directories in the specified fontawesome directory.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from '../lib/logger.js';
import config from '../lib/config.js';
import iconsets from '../lib/iconsets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let [,, iconDir, faVersion] = process.argv;

if (!iconDir) {
  logger.error('Usage: node process-fa.js <icon-directory>');
  process.exit(1);
}

// ensure the icon directory exists
if (!fs.existsSync(iconDir)) {
  logger.error(`Icon directory does not exist: ${iconDir}`);
  process.exit(1);
}

// ensure fontawesome node module is downloaded
const faPath = path.join(iconDir, 'node_modules', config.fontAwesome.nodeModulePath);
if (!fs.existsSync(faPath)) {
  logger.error(`FontAwesome node module not found in ${faPath}.`);
  process.exit(1);
}

// if faVersion is not provided, read it from package.json
if (!faVersion) {
  const pkgPath = path.join(faPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    logger.error(`package.json not found in ${faPath}`);
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  faVersion = pkg.version;
}
const iconsetName = `fontawesome-${faVersion}`;

logger.info(`Creating iconset '${iconsetName}' from directory '${iconDir}'`);

// check if iconsets directory exists, if it does bail
const iconsetsDir = path.join(iconDir, 'iconsets');
if (fs.existsSync(iconsetsDir)) {
  console.error(`Iconsets directory already exists: ${iconsetsDir}. Please remove it before running this script.`);
  process.exit(1);
}

// delete dist directory if it exists
const distDir = path.join(iconDir, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  logger.info(`Deleted existing dist directory: ${distDir}`);
}
fs.mkdirSync(distDir, { recursive: true });

// create iconsets directory,
fs.mkdirSync(iconsetsDir, { recursive: true });

// find all svg iconsets in the FontAwesome node module
const faSvgDir = path.join(faPath, config.fontAwesome.svgDirectory);
if (!fs.existsSync(faSvgDir)) {
  console.error(`FontAwesome SVG directory not found: ${faSvgDir}`);
  process.exit(1);
}
const iconsetNames = fs.readdirSync(faSvgDir).filter(name => {
  const fullPath = path.join(faSvgDir, name);
  return fs.statSync(fullPath).isDirectory();
});

// 1. create an iconset for each folder in the svg directory
// 2. copy all svgs
// 3. create a metadata file for each iconset
// 4. create zip file for each iconset
const summary = {name: iconsetName, iconsets: []};
for (const name of iconsetNames) {
  const fullName = `${iconsetName}-${name}`;
  const iconsetSummary = {name: fullName, iconCount: 0};
  const iconsetPath = path.join(iconsetsDir, fullName, 'icons');
  fs.mkdirSync(iconsetPath, { recursive: true });
  const sourcePath = path.join(faSvgDir, name);
  const files = fs.readdirSync(sourcePath).filter(file => file.endsWith('.svg'));
  files.forEach(file => {
    const srcFile = path.join(sourcePath, file);
    const destFile = path.join(iconsetPath, file);
    fs.copyFileSync(srcFile, destFile);
    logger.info(`Copied ${file} to ${iconsetPath}`);
    iconsetSummary.iconCount++;
  });

  const iconset = iconsets.createFromFontAwesome(fullName, path.join(faPath, config.fontAwesome.iconMetadataFile), path.join(iconsetsDir, fullName));
  iconset.writeMetadata();
  await iconset.zip(distDir);
  logger.info(`Created iconset: ${fullName}`);


  summary.iconsets.push(iconsetSummary);
}

logger.info('Iconsets created successfully', summary);
