import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';
import archiver from 'archiver';
import config from './config.js';

/**
 * @description Iconsets class to manage iconsets and their icons.
 */
class Iconsets {

  constructor(){
    this.iconsets = [];
  }

  /**
   * @description Register an iconset by name. Will be added to the iconsets array.
   * @param {String} name - The name of the iconset to register. This should match the directory name in the iconset directory.
   * @param {Object} opts - Options for the iconset.
   * @param {Array} opts.aliases - An array of aliases for the iconset. Optional.
   * @returns
   */
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
   * @description Search for icons across all registered iconsets.
   * @param {String} query - The search term to use for searching icons.
   * @param {Object} opts - Options for the search.
   * @param {Number} opts.limit - The maximum number of results to return. Defaults to config.search.resultsLimitDefault.
   * @param {Array} opts.iconsets - An array of iconset names to limit the search to. If not provided, searches all iconsets.
   * @returns {Array} - An array of icon objects that match the search query.
   */
  search(query, opts={}){
    if ( !query ) return [];
    const limit = opts.limit || config.search.resultsLimitDefault;
    const results = [];
    for (const iconset of this.iconsets) {
      if ( Array.isArray(opts.iconsets) && !opts.iconsets.includes(iconset.name) ) {
        continue;
      }
      const iconResults = iconset.search(query, limit);
      for (const icon of iconResults) {
        results.push(icon);
        if ( results.length >= limit ) break;
      }
      if ( results.length >= limit ) break;
    }
    return results;
  }

  /**
   * @description Get icon from registered iconsets by full name (e.g. 'iconset.icon-name').
   * @param {Sting} name
   * @returns {Object|null} - Returns the icon object with its contents, or null if not found.
   * @param {Object} opts - Options to pass to the iconset's getIcon method.
   */
  getIcon(name, opts={}){
    if ( !name ) return null;
    for (const iconset of this.iconsets) {
      if ( !iconset.hasIcon(name) ) continue;
      const parts = name.split('.');
      const iconName = parts.pop();
      return iconset.getIcon(iconName, opts);
    }
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
   * @description Get basic information about the iconset.
   * @returns {Object}
   */
  describe(){
    return {
      name: this.name,
      label: this.label,
      aliases: this.aliases,
      iconCount: this.icons.length,
      faSet: this.faSet,
      faVersion: this.faVersion
    }
  }

  /**
   * @description Search for icons in the iconset based on a search term.
   * @param {String} query - The search term to use for searching icons.
   * @param {Number} limit - The maximum number of results to return. Defaults to config.search.resultsLimitDefault.
   * @returns
   */
  search(query, limit){
    if ( !query ) return [];
    if ( !limit ) limit = config.search.resultsLimitDefault;

    let re = new RegExp(query.replace(/[^a-zA-Z0-9]/g, ''), 'i');
    const results = [];
    for (const icon of this.icons) {
      if ( icon.name.match(re) || icon.label.match(re) || icon.searchTerms.some(term => term.match(re)) ){
        results.push(this.getIcon(icon.name, { excludeProps: ['searchTerms', 'file'] }));
      }
      if ( results.length >= limit ) break;
    }
    return results;
  }

  /**
   * @description Check if the iconset name or any of its aliases match the provided name.
   * @param {String} name
   * @returns {Boolean}
   */
  isNameOrAlias(name){
    if ( !name ) return false;
    if ( this.name === name ) return true;
    if ( this.aliases.includes(name) ) return true;
    return false;
  }

  /**
   * @description Check if the iconset has an icon with the given name.
   * @param {String} name - Name of the icon with or without an iconset prefix. e.g. 'iconset.icon-name' or 'iconName'.
   * @returns {Boolean}
   */
  hasIcon(name){
    if ( !name ) return false;

    // if name has a dot, it is in the format 'iconset.iconName'
    if ( name.includes('.') ){
      const parts = name.split('.');
      const iconName = parts.pop();
      const iconsetName = parts.join('.');
      if ( this.isNameOrAlias(iconsetName) ){
        return this.icons.some(icon => icon.name === iconName);
      }
      return false;
    }

    // otherwise, just check if the icon exists in this iconset
    return this.icons.some(icon => icon.name === name);
  }

  /**
   * @description Get icon with its file contents.
   * @param {String|Object} nameOrObj - The name of the icon or an icon object from this.icons array.
   * @returns {Object|null} - Returns the icon object with its contents, or null if not found.
   */
  getIcon(nameOrObj, opts={}){
    const excludeProps = opts.excludeProps || [];
    if ( typeof nameOrObj === 'string' ){
      nameOrObj = this.icons.find(icon => icon.name === nameOrObj);
    }
    if ( !nameOrObj?.name ) return null;
    let icon = { ...nameOrObj, iconset: this.name };
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
      icon.contents = fs.readFileSync(iconFile, 'utf-8').replace(/[\r\n]+$/g, '');
      this.iconContents.set(icon.name, icon.contents);
    } else {
      icon.contents = this.iconContents.get(icon.name);
    }

    for (const prop of excludeProps) {
      delete icon[prop];
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
