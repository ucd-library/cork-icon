/**
 * @description Update metadata file for a custom iconset based on icons available in a directory.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from '../lib/logger.js';
import config from '../lib/config.js';
import iconsets from '../lib/iconsets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let [,, iconDir, zipDir] = process.argv;

if (!iconDir) {
  logger.error('Usage: node process-custom.js <icon-directory>');
  process.exit(1);
}

// ensure the icon directory exists
if (!fs.existsSync(iconDir)) {
  logger.error(`Icon directory does not exist: ${iconDir}`);
  process.exit(1);
}

const iconset = iconsets.createFromDirectory(iconDir);
if (!iconset) {
  process.exit(1);
}

// register new icons
iconset.registerNewIcons();

// unregister icons that are no longer present
iconset.unregisterIcons();

// write metadata
iconset.writeMetadata();

zipDir = zipDir || path.join(iconDir, '../..', 'dist');
let zipped = false;
if (fs.existsSync(zipDir)) {
  logger.info(`Zipping iconset '${iconset.name}' to '${zipDir}'`);
  await iconset.zip(zipDir);
  zipped = true;
} else {
  logger.warn(`Zip directory '${zipDir}' does not exist. Skipping zipping.`);
}

const summary = {
  iconsRegistered: iconset.iconsRegistered.length,
  iconsUnregistered: iconset.iconsUnregistered.length,
  zippedTo: zipped ? zipDir : 'not zipped',
  iconsTotal: iconset.icons.length
}
logger.info(`Iconset '${iconset.name}' processed successfully.`, summary);
