import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';
import archiver from 'archiver';

class Iconsets {

  createFromDirectory(directory){
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
      directory: directory
    };

    return new Iconset(opts);
  }

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
    this.label = opts.label || opts.name;
    this.directory = opts.directory;
    this.icons = opts.icons || [];
    this.faSet = opts.faSet || null;
    this.faVersion = opts.faVersion || null;
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
      if ( this.icons.some(icon => icon.name === iconName) ) {
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

  writeMetadata(){
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
