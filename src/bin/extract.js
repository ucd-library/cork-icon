#!/usr/bin/env node

/**
 * @description Extracts selected icons, formats them for web use, and saves them to a specified directory.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import preload from '../lib/preload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let [,, inputFile, outputFormat, outputDir, outputFileName] = process.argv;

const usage = `Usage: extract <input-file> [output-format] [output-dir] [output-file-name]

  <input-file>       Path to the json file with preload arguments (required)
  [output-format]    Output format: html, js, json (default: html)
  [output-dir]      Directory to save the output file (default: current directory)
  [output-file-name] Name of the output file without extension (default: same as input file)

Example:
  extract icon-defs.json html ./output icons
`;

// validate input file
if ( !inputFile ){
  console.error(usage);
  process.exit(1);
}
if ( !path.isAbsolute(inputFile) ){
  inputFile = path.resolve(process.cwd(), inputFile);
}
if ( !fs.existsSync(inputFile) || !fs.lstatSync(inputFile).isFile() ){
  console.error(`Input file does not exist: ${inputFile}`);
  console.log(usage);
  process.exit(1);
}

// validate output options
const outputFormatOptions = ['html', 'js', 'json'];
outputFormat = outputFormat || outputFormatOptions[0];
if ( !outputFormatOptions.includes(outputFormat) ){
  console.error(`Invalid output format: ${outputFormat}`);
  console.error(usage);
  process.exit(1);
}

// validate output directory
outputDir = outputDir || '.';
if ( !path.isAbsolute(outputDir) ){
  console.log(process.cwd());
  outputDir = path.resolve(process.cwd(), outputDir);
}
if ( !fs.existsSync(outputDir) ){
  fs.mkdirSync(outputDir, { recursive: true });
}

// validate output file name
outputFileName = outputFileName || path.basename(inputFile);
const ext = path.extname(outputFileName);
if (ext) {
  outputFileName = outputFileName.slice(0, -ext.length);
}
outputFileName = `${outputFileName}.${outputFormat}`;
const outputFilePath = path.join(outputDir, outputFileName);

// read input file
let preloadArgs;
try {
  const data = fs.readFileSync(inputFile, 'utf-8');
  preloadArgs = JSON.parse(data);
} catch (err) {
  console.error(`Failed to read or parse input file: ${err.message}`);
  process.exit(1);
}

// extract icons
let extracted = preload(preloadArgs);

// format output
if ( outputFormat === 'js' ){
  extracted = `export default String.raw\`${extracted}\`;`;
} else if ( outputFormat === 'json' ){
  extracted = extracted.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '$1').trim();
  extracted = JSON.parse(extracted);
  extracted = JSON.stringify(extracted, null, 2);
}

// write output file
if (inputFile === outputFilePath) {
  console.error('Input file path matches output file path. Aborting to prevent overwrite.');
  process.exit(1);
}
try {
  fs.writeFileSync(outputFilePath, extracted, 'utf-8');
  console.log(`Extracted icons saved to ${outputFilePath}`);
} catch (err) {
  console.error(`Failed to write output file: ${err.message}`);
  process.exit(1);
}

process.exit(0);