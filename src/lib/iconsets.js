import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';
import archiver from 'archiver';
import config from './config.js';

class Iconsets {

  constructor(){
    this.iconsets = [];
  }

  register(name, opts={}){
    logger.info(`Registering iconset '${name}'`);
    if ( !name ) {
      logger.error('Iconset name is required');
      return;
    }

    // check if iconset already exists
    const existing = this.iconsets.find(iconset => iconset.name === name);
    if ( existing ) {
      logger.info(`Iconset '${name}' already registered. Skipping.`);
      return existing;
    }

    const directory = path.join(config.iconSet.directory, name);
    const iconset = this.createFromDirectory(directory, opts.aliases);
    if ( !iconset ) {
      logger.error(`Failed to create iconset '${name}' from directory '${directory}'`);
      return null;
    }

    this.iconsets.push(iconset);

    return iconset;
  }

  /**
   * @description Instantiate iconset class from a directory containing a metadata.json file.
   * @param {*} directory
   * @returns {Iconset|null}
   */
  createFromDirectory(directory, aliases){
    logger.info(`Creating iconset from directory '${directory}'`);

    // check for metadata.json file
    const metadataFile = path.join(directory, 'metadata.json');
    if ( !fs.existsSync(metadataFile) ) {
      logger.error(`No metadata.json file found in directory '${directory}'`);
      return null;
    }
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    if ( !metadata.name ) {
      logger.error(`No name found in metadata.json file in directory '${directory}'`);
      return null;
    }

    const opts = {
      ...metadata,
      aliases,
      directory
    };

    return new Iconset(opts);
  }

  /**
   * @description Instantiate iconset class from a FontAwesome metadata file.
   * @param {String} name - the name of the iconset, typically in the format 'fontawesome-{version}-{iconsetName}'
   * @param {String} yamlMetadata - the path to the FontAwesome YAML metadata file
   * @param {String} directory - the directory containing the fa iconsets
   * @returns
   */
  createFromFontAwesome(name, yamlMetadata, directory){
    logger.info(`Creating iconset '${name}' from FontAwesome metadata file '${yamlMetadata}' in directory '${directory}'`);
    const [, version, iconsetName] = name.split('-');
    const file = yaml.load(fs.readFileSync(yamlMetadata, 'utf-8'));
    const icons = Object.entries(file).map(([iconName, iconData]) => {
      // skip icons not in this set
      if ( !(iconData?.styles || []).includes(iconsetName) ) {
        return null;
      }
      return {
        name: iconName,
        label: iconData.label || iconName,
        fileType: 'svg',
        file: `${iconName}.svg`,
        searchTerms: iconData?.search?.terms || []
      }
    }).filter(x => x);
    const opts = {
      name,
      label: `FontAwesome ${iconsetName[0].toUpperCase()}${iconsetName.slice(1)} ${version}`,
      directory: directory,
      faSet: iconsetName,
      faVersion: version,
      icons: icons
    };
    const iconset = new Iconset(opts);
    return iconset;
  }
}


class Iconset {
  constructor(opts){
    this.name = opts.name;
    this.aliases = opts.aliases || [];
    this.label = opts.label || opts.name;
    this.directory = opts.directory;
    this.icons = opts.icons || [];
    this.faSet = opts.faSet || null;
    this.faVersion = opts.faVersion || null;

    this.iconContents = new Map();
  }

  /**
   * @description Get icon with its file contents.
   * @param {String|Object} nameOrObj - The name of the icon or an icon object from this.icons array.
   * @returns {Object|null} - Returns the icon object with its contents, or null if not found.
   */
  getIcon(nameOrObj){
    if ( typeof nameOrObj === 'string' ){
      nameOrObj = this.icons.find(icon => icon.name === nameOrObj);
    }
    if ( !nameOrObj?.name ) return null;
    let icon = { ...nameOrObj };
    if ( !icon.file ) {
      logger.error(`Icon '${icon.name}' does not have a file associated with it in iconset '${this.name}'`);
      return null;
    }
    if ( !this.iconContents.has(icon.name) ){
      const iconFile = path.join(this.directory, 'icons', icon.file);
      if ( !fs.existsSync(iconFile) ) {
        logger.error(`Icon file '${icon.file}' for icon '${icon.name}' does not exist in iconset '${this.name}'`);
        return null;
      }
      icon.contents = fs.readFileSync(iconFile, 'utf-8');
      this.iconContents.set(icon.name, icon.contents);
    } else {
      icon.contents = this.iconContents.get(icon.name);
    }

    return icon;
  }

  /**
   * @description Register new icons from the 'icons' directory in the iconset's directory.
   * Aka, adds new entries to this.icons array.
   */
  registerNewIcons(){
    if ( !this.directory ) {
      logger.error(`No directory specified for iconset '${this.name}'`);
      return;
    }

    // ensure the directory exists
    const iconDir = path.join(this.directory, 'icons');
    if ( !fs.existsSync(iconDir) ) {
      logger.info(`Creating icons directory for iconset '${this.name}' at '${iconDir}'`);
      fs.mkdirSync(iconDir, { recursive: true });
    }

    this.iconsRegistered = [];
    // loop through files in the icons directory
    for (const file of fs.readdirSync(iconDir)) {
      if ( !file.endsWith('.svg') ) {
        logger.warn(`Currently only SVG icons are supported. Skipping file '${file}' in iconset '${this.name}'`);
        continue;
      }
      const iconName = path.basename(file, '.svg');
      // check if icon already exists
      if ( this.icons.some(icon => icon.file === file) ) {
        //logger.info(`Icon '${iconName}' already exists in iconset '${this.name}'. Skipping.`);
        continue;
      }
      this.icons.push({
        name: iconName,
        label: iconName,
        fileType: 'svg',
        file: file,
        searchTerms: []
      });
      this.iconsRegistered.push(iconName);
      logger.info(`Added icon '${iconName}' to iconset '${this.name}'`);
    }
  }

  /**
   * @description Unregister icons that are no longer present in the 'icons' directory.
   * Aka, removes entries from this.icons array.
   */
  unregisterIcons(){
    if ( !this.directory ) {
      logger.error(`No directory specified for iconset '${this.name}'`);
      return;
    }

    // ensure the directory exists
    const iconDir = path.join(this.directory, 'icons');
    if ( !fs.existsSync(iconDir) ) {
      logger.info(`Icons directory for iconset '${this.name}' does not exist at '${iconDir}'. Nothing to unregister.`);
      return;
    }

    this.iconsUnregistered = [];
    for (const icon of this.icons) {
      const iconFile = path.join(iconDir, icon.file);
      if ( !fs.existsSync(iconFile) ) {
        logger.info(`Removed icon '${icon.name}' from iconset '${this.name}'`);
        this.iconsUnregistered.push(icon.name);
      }
    }

    this.icons = this.icons.filter(icon => !this.iconsUnregistered.includes(icon.name));
  }

  /**
   * @description Write metadata file for the iconset.
   * This will create a metadata.json file in the iconset's directory.
   * @returns
   */
  writeMetadata(){
    if ( !this.directory ) {
      logger.error(`No directory specified for iconset '${this.name}'`);
      return;
    }

    // sort icons by name
    this.icons.sort((a, b) => a.name.localeCompare(b.name));

    logger.info(`Writing metadata for iconset '${this.name}' to '${this.directory}'`);
    const metadataFile = path.join(this.directory, `metadata.json`);
    const metadata = {
      name: this.name,
      label: this.label,
      faSet: this.faSet,
      faVersion: this.faVersion,
      iconCount: this.icons.length,
      icons: this.icons.map(icon => ({
        name: icon.name,
        label: icon.label,
        fileType: icon.fileType,
        file: icon.file,
        searchTerms: icon.searchTerms
      }))
    };
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  }

  /**
   * @description Zip the iconset directory.
   * @param {String} outputPath - The path where the zip file will be created.
   */
  async zip(outputPath){
    let outputFile = path.join(outputPath, `${this.name}.zip`);
    logger.info(`Zipping iconset '${this.name}' to '${outputFile}'`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputFile);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });
      output.on('close', () => {
        logger.info(`Zipped iconset '${this.name}' to '${outputFile}'`);
        resolve();
      });
      output.on('error', (err) => {
        logger.error(`Error zipping iconset '${this.name}': ${err.message}`);
        reject(err);
      });
      archive.on('error', (err) => {
        logger.error(`Error creating zip for iconset '${this.name}': ${err.message}`);
        reject(err);
      });
      archive.pipe(output);
      archive.directory(this.directory, false);
      archive.finalize();
    });

  }
};

export default new Iconsets();
