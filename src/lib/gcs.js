import config from './config.js';
import logger from './logger.js';
import { Storage } from '@google-cloud/storage';

class Gcs {

  async downloadAllIconsets(){
    if ( !config.gc.keyFileExists ) {
      logger.error('Google Cloud key file does not exist. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable.');
      return;
    }
    logger.info(`Downloading iconsets from GCS bucket: ${config.iconSet.gcBucket}`);
    //const storage = new Storage();
  }

}

export default new Gcs();
