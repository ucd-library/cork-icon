import config from './config.js';
import logger from './logger.js';
import { Storage } from '@google-cloud/storage';
import unzipper from 'unzipper';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Gcs {

  /**
   * @description Updates the manifest file in the GCS bucket with the contents of the 'dist' directory.
   * Needed so that the package can automatically download the latest iconsets on install.
   *
   */
  async syncManifestFile(){
    logger.info(`Syncing manifest file with contents of GCS bucket: ${config.iconSet.gcBucket}`);
    const storage = new Storage();
    const bucket = storage.bucket(config.iconSet.gcBucket);
    const prefix = 'dist/';
    const [files] = await bucket.getFiles({ prefix });

    const manifest = [];
    for (const file of files) {
      const relativePath = file.name.replace(prefix, '');
      if (!relativePath || relativePath.endsWith('/')) continue;
      if ( relativePath === 'manifest.json' ) continue; // Skip existing manifest file
      manifest.push(relativePath);
    }

    const manifestJson = JSON.stringify(manifest, null, 2);
    const manifestFile = bucket.file('dist/manifest.json');
    await manifestFile.save(manifestJson, {
      contentType: 'application/json'
    });
    logger.info('Manifest file uploaded to GCS as dist/manifest.json');
  }

  /**
   * @description Downloads a public file from a given URL and saves it to the specified destination path.
   * @param {*} url
   * @param {*} destPath
   */
  async downloadPublicFile(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} — status ${res.status}`);
    }

    await fsp.mkdir(path.dirname(destPath), { recursive: true });
    const fileStream = fs.createWriteStream(destPath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    logger.info(`Downloaded: ${destPath}`);
  }

  /**
   * @description Downloads all iconsets from the public GCS bucket and unzips them into the local directory
   * for consumption by the package.
   * @returns
   */
  async downloadAllIconsets() {
    const bucket = config.iconSet.gcBucket;
    const prefix = 'dist/';
    const manifestUrl = `https://storage.googleapis.com/${bucket}/${prefix}manifest.json`;

    logger.info(`Fetching manifest from: ${manifestUrl}`);
    const manifestRes = await fetch(manifestUrl);
    if (!manifestRes.ok) {
      throw new Error(`Failed to fetch manifest: ${manifestRes.status}`);
    }

    const files = await manifestRes.json();
    if (!Array.isArray(files) || files.length === 0) {
      logger.warn('No files listed in manifest.');
      return;
    }

    logger.info(`Found ${files.length} files in manifest.`);

    for (const file of files) {

      const url = `https://storage.googleapis.com/${bucket}/${prefix}${file}`;
      const localPath = path.join(config.iconSet.directory, file);

      try {
        await this.downloadPublicFile(url, localPath);
      } catch (err) {
        logger.warn(`Failed to download iconset ${url}: ${err.message}`);
        continue;
      }

      if (localPath.endsWith('.zip')) {
        const baseName = path.basename(localPath, '.zip');
        const unzipTarget = path.join(path.dirname(localPath), baseName);
        await fsp.mkdir(unzipTarget, { recursive: true });
        logger.info(`Unzipping file: ${unzipTarget}`);
        await fs.createReadStream(localPath)
          .pipe(unzipper.Extract({ path: unzipTarget }))
          .promise();
        logger.info(`Unzipped file: ${unzipTarget}`);
      }
    }

    logger.info('All iconsets downloaded and unzipped successfully.');
  }

}

export default new Gcs();
