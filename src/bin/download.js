#!/usr/bin/env node

import gcs from '../lib/gcs.js';
import logger from '../lib/logger.js';

/**
 * @description Downloads iconsets from Google Cloud Storage.
 */
async function downloadIconsets() {
  try {
    await gcs.downloadAllIconsets();
  } catch (error) {
    logger.error('Failed to download iconsets', error);
  }
}

// Execute the download function
await downloadIconsets();

