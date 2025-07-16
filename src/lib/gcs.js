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

    let fileErrorCount = 0;
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

        let zipFileErrorCount = 0;
        await new Promise((resolve, reject) => {
          fs.createReadStream(localPath)
            .pipe(unzipper.Parse())
            .on('entry', async function (entry) {
              logger.info(`Extracting: ${entry.path} from ${localPath}`);
              const filePath = path.join(unzipTarget, entry.path);

              try {
                if (entry.type === 'Directory') {
                  await fsp.mkdir(filePath, { recursive: true });
                  entry.autodrain();
                } else {
                  await fsp.mkdir(path.dirname(filePath), { recursive: true });
                  entry.pipe(fs.createWriteStream(filePath));
                }
              } catch (err) {
                logger.error(`Failed to extract ${entry.path}: ${err.message}`);
                entry.autodrain();
                fileErrorCount++;
                zipFileErrorCount++;
              }
            })
            .on('error', err => {
              logger.error('Unzip error:', err);
              reject(err);
            })
            .on('close', () => {
              logger.info('Unzip complete');
              if (zipFileErrorCount > 0) {
                logger.warn(`Encountered ${zipFileErrorCount} errors while extracting files from ${localPath}`);
              }
              resolve();
            });
        });
      }
    }

    logger.info(`Downloaded and processed ${files.length} iconsets from cork-icon GCS bucket.`);
    if (fileErrorCount > 0) {
      logger.warn(`Unabled to unzip ${fileErrorCount} total icon files. Check logs for details.`);
    }
  }

}

export default new Gcs();
