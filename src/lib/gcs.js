import config from './config.js';
import logger from './logger.js';
import { Storage } from '@google-cloud/storage';
import unzipper from 'unzipper';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Gcs {

  async downloadAllIconsets(){
    logger.info(`Downloading iconsets from GCS bucket: ${config.iconSet.gcBucket} to ${config.iconSet.directory}`);
    const storage = new Storage();

    const bucket = storage.bucket(config.iconSet.gcBucket);
    const prefix = 'dist/';
    const [files] = await bucket.getFiles({ prefix });

    if (files.length === 0) {
      logger.warn('No files found in the GCS bucket with the specified prefix.');
      return;
    }
    logger.info(`Found ${files.length} files in the GCS bucket with prefix "${prefix}"`);

    for (const file of files) {
      const relativePath = file.name.replace(prefix, '');
      if (!relativePath || relativePath.endsWith('/')) continue; // skip folder-like keys

      const localPath = path.join(config.iconSet.directory, relativePath);
      await fsp.mkdir(path.dirname(localPath), { recursive: true });

      await file.download({ destination: localPath });
      logger.info(`Downloaded file: ${localPath}`);

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
