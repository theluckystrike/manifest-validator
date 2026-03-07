#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validateManifest } from './index';

async function main() {
  const filePath = process.argv[2] || 'manifest.json';
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(chalk.red(`Error: File not found at ${absolutePath}`));
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(absolutePath, 'utf-8');
    const manifest = JSON.parse(content);
    const result = validateManifest(manifest);

    if (result.valid) {
      console.log(chalk.green('✔ manifest.json is valid for MV3.'));
    } else {
      console.log(chalk.red(`✖ Found ${result.errors.length} errors.`));
      result.errors.forEach(err => console.log(chalk.red(` - ${err}`)));
    }

    if (result.suggestions.length > 0) {
      console.log(chalk.yellow('\nSuggestions:'));
      result.suggestions.forEach(s => console.log(chalk.yellow(` - ${s}`)));
    }

    if (!result.valid) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error(chalk.red(`Error parsing JSON: ${err.message}`));
    process.exit(1);
  }
}

main();
