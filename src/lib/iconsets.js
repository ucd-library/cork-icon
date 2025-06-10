import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';
import archiver from 'archiver';

class Iconsets {

  createFromDirectory(directory){
    // read from existing metadata file
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

  writeMetadata(){
    logger.info(`Writing metadata for iconset '${this.name}' to '${this.directory}'`);
    const metadataFile = path.join(this.directory, `${this.name}.json`);
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
