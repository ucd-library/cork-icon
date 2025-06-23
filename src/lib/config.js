import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Config {
  constructor(){
    const ns = 'CORK_ICON_'

    this.iconSet = {
      directory: this.getEnv(`${ns}ICON_SET_DIRECTORY`, path.join(__dirname, '../iconsets')),
      gcBucket: this.getEnv(`${ns}ICON_SET_GC_BUCKET`, 'cork-icon')
    };

    this.logger = {
      name: this.getEnv(`${ns}LOGGER_NAME`, 'cork-icon'),
      level: this.getEnv(`${ns}LOGGER_LEVEL`, '')
    }

    this.gc = {
      keyFilePath: this.getEnv(`GOOGLE_APPLICATION_CREDENTIALS`),
      keyFileExists: false
    };
    if ( this.gc.keyFilePath ) {
      this.gc.keyFileExists = fs.existsSync(this.gc.keyFilePath);
    }

    this.fontAwesome = {
      nodeModulePath: '@fortawesome/fontawesome-free',
      svgDirectory: 'svgs',
      iconMetadataFile: 'metadata/icons.yml'
    }

  }

  /**
   * @description Get an environment variable.  If the variable is not set, return the default value.
   * @param {String} name - The name of the environment variable.
   * @param {*} defaultValue - The default value to return if the environment variable is not set.
   * @param {Boolean} errorIfMissing - If true, throw an error if the environment variable is not set.
   * @returns
   */
  getEnv(name, defaultValue=false, errorIfMissing=false){
    const env = process?.env?.[name]
    if ( env ) {
      if ( env.toLowerCase() == 'true' ) return true;
      if ( env.toLowerCase() == 'false' ) return false;
      return env;
    }
    if ( errorIfMissing && !this.ignoreEnvError ) {
      throw new Error(`Environment variable ${name} is required`);
    }
    return defaultValue;
  }

  toArray(str){
    if ( !str ) return [];
    return str.split(',').map( s => s.trim() );
  }
}

export default new Config();
