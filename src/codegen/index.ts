#!/usr/bin/env node

import {generator} from './generator';
import {parser} from './parser';
import fs from 'fs';
import path from 'path';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = function (relativePath: string) {
  return path.resolve(appDirectory, relativePath);
};

const configPath = resolveApp('graphql-typescript-codegen.json');
type Config = {
  generatedOutputPath?: string;
};
const config = fs.existsSync(configPath)
  ? (JSON.parse(fs.readFileSync(configPath).toString()) as Config)
  : {};

const outputFilePath = resolveApp(
  config.generatedOutputPath ?? 'GeneratedGraphQLSchema.js',
);

const generatedFileContents = generator(
  parser({resolveImportsRelativeTo: path.dirname(outputFilePath)}),
);
fs.writeFileSync(outputFilePath, generatedFileContents);
