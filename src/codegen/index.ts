#!/usr/bin/env node

import {generator} from './generator';
import {parser} from './parser';
import fs from 'fs';
import path from 'path';
import sade from 'sade';
import ora from 'ora';
import {printSchema} from 'graphql';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = function (relativePath: string) {
  return path.resolve(appDirectory, relativePath);
};

type Config = {
  generatedPathJS: string;
  generatedPathSchema: string;
};
const configPath = resolveApp('graphql-typescript-codegen.json');
const config = fs.existsSync(configPath)
  ? (JSON.parse(fs.readFileSync(configPath).toString()) as Config)
  : null;

const prog = sade('graphql-typescript-codegen', true)
  .option('--verbose, -V', 'Enable verbose logging', false)
  .option('--init', 'Create config file')
  .action((opts) => {
    if (opts.init) {
      if (fs.existsSync(configPath)) {
        console.error('Config file already exists');
        return;
      }

      const defaultConfig: Config = {
        generatedPathJS: 'src/GeneratedGraphQLSchema.js',
        generatedPathSchema: 'src/graphql.schema',
      };

      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('Created config file.');
      return;
    }

    if (!config) {
      console.log('Config file missing. Run with --init to create it.');
      return;
    }

    const outputFilePath = resolveApp(config.generatedPathJS);
    const o = ora({text: 'Generating GraphQL JS'}).start();
    const generatedFileContents = generator(
      parser({resolveImportsRelativeTo: path.dirname(outputFilePath)}),
    );
    fs.writeFileSync(outputFilePath, generatedFileContents);
    o.succeed('Generated GraphQL JS');
    o.text = 'Priting schema';
    const schema = printSchema(require(outputFilePath).schema);
    fs.writeFileSync(resolveApp(config.generatedPathSchema), schema);
    o.succeed('Printed schema');
  });
prog.parse(process.argv);
