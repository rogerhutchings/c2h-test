#!/usr/bin/env node
import path from 'path';
import program from 'commander';
import mapValues from 'lodash/mapValues';
import fsp from 'fs-promise';
import yaml from 'js-yaml';

import main from './index';

program
  .arguments('<outputDir>')
  .option('-s, --space <space>', 'Specify Contentful space')
  .option('-a, --access-token <accessToken>', 'Contentful API access token')
  .option('-c, --config <configFilePath>', 'Path to a config.yaml file')
  .parse(process.argv);

const errorAndExit = (message) => {
  console.log(message);
  process.exit(1);
};

const openConfigFile = (configFilePath) => {
  return fsp.readFile(configFilePath, 'utf8')
    .then(configContents => yaml.safeLoad(configContents))
    .catch(error => (error.code === 'ENOENT')
      ? console.log('Specified config file (%s) not found, attempting to continue...', configFilePath)
      : errorAndExit(error)
    );
};

const createOptions = (configFileData = {}) => {
  return {
    outputDir: {
      value: program.args[0] || false,
      errorMessage: 'Output directory not specified',
    },
    space: {
      value: configFileData.space || program.space || process.env.CONTENTFUL_SPACE || false,
      errorMessage: 'Contentful space ID not specified',
    },
    accessToken: {
      value: configFileData.accessToken || program.accessToken || process.env.CONTENTFUL_ACCESS_TOKEN || false,
      errorMessage: 'Contentful API access token not specified',
    },
  };
};

const validateOptions = (options) => {
  for (var prop in options) {
    if (!options.hasOwnProperty(prop)) {
      continue;
    }

    if (!options[prop].value) {
      errorAndExit(options[prop].errorMessage);
    }
  }

  options.outputDir.value = path.resolve(process.cwd(), options.outputDir.value);
  return mapValues(options, 'value');
};

if (program.config) {
  const configFilePath = path.resolve(process.cwd(), program.config);
  openConfigFile(configFilePath)
    .then(createOptions)
    .then(validateOptions)
    .then(main);
} else {
  new Promise(resolve => resolve())
    .then(createOptions)
    .then(validateOptions)
    .then(main);
}
