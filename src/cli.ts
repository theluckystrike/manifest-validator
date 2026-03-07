#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validateManifest, fixManifest } from './index';

async function main() {
  const isFix = process.argv.includes('--fix');
  // Filter out the --fix flag to find the file path
  const args = process.argv.slice(2).filter(arg => arg !== '--fix');
  const filePath = args[0] || 'manifest.json';
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(chalk.red(`Error: File not found at ${absolutePath}`));
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(absolutePath, 'utf-8');
    let manifest = JSON.parse(content);

    if (isFix) {
      const fixed = fixManifest(manifest);
      const fixedContent = JSON.stringify(fixed, null, 2);
      if (fixedContent !== JSON.stringify(manifest, null, 2)) {
        fs.writeFileSync(absolutePath, fixedContent, 'utf-8');
        console.log(chalk.blue.bold(`\nApplied auto-fixes to ${filePath}.\n`));
        manifest = fixed;
      }
    }

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
