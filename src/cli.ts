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
      console.log(chalk.green.bold('\n✔ Manifest is valid for Manifest V3!\n'));
    } else {
      console.log(chalk.red.bold(`\n✖ Validation Failed: ${result.errors.length} error(s) found.\n`));
      result.errors.forEach(err => console.log(chalk.red(`  [ERROR] ${err}`)));
    }

    if (result.suggestions.length > 0) {
      console.log(chalk.cyan.bold('\n💡 Actionable Suggestions:'));
      // Remove duplicates from suggestions
      const uniqueSuggestions = Array.from(new Set(result.suggestions));
      uniqueSuggestions.forEach(s => console.log(chalk.cyan(`  - ${s}`)));
      console.log('');
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
