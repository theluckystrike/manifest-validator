# @theluckystrike/manifest-validator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-v1.0.0-cb3837?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@theluckystrike/manifest-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-969464?style=flat-square)](https://opensource.org/licenses/MIT)
[![Last Commit](https://img.shields.io/github/last-commit/theluckystrike/manifest-validator/main?style=flat-square)](https://github.com/theluckystrike/manifest-validator/commits/main)
[![Stars](https://img.shields.io/github/stars/theluckystrike/manifest-validator?style=flat-square)](https://github.com/theluckystrike/manifest-validator)

A powerful toolkit for validating Chrome Extension `manifest.json` files for Manifest V3 compliance. Get actionable suggestions to fix identified errors and even auto-fix common MV2 → MV3 migration issues.

## Features

- ✅ Validates Manifest V3 compliance
- ✅ Comprehensive error detection with actionable suggestions
- ✅ Auto-fix capabilities for MV2 → MV3 migration
- ✅ CLI and programmatic API
- ✅ TypeScript support

## Installation

```bash
# Global installation (CLI usage)
npm install -g @theluckystrike/manifest-validator

# Local installation (programmatic usage)
npm install @theluckystrike/manifest-validator
```

## Usage

### CLI

Validate your extension's `manifest.json`:

```bash
manifest-validator ./manifest.json
```

Auto-fix common issues (MV2 → MV3 migration):

```bash
manifest-validator ./manifest.json --fix
```

### Programmatic API

```typescript
import { validateManifest, fixManifest, ValidationResult } from '@theluckystrike/manifest-validator';

// Validate a manifest
const manifest = {
  manifest_version: 3,
  name: 'My Extension',
  version: '1.0.0',
  icons: {
    '16': 'icon16.png',
    '48': 'icon48.png',
    '128': 'icon128.png'
  },
  action: {
    default_popup: 'popup.html'
  },
  background: {
    service_worker: 'background.js'
  },
  permissions: ['storage', 'tabs'],
  host_permissions: ['https://*.example.com/*']
};

const result: ValidationResult = validateManifest(manifest);

if (result.valid) {
  console.log('✓ Manifest is valid for Manifest V3!');
} else {
  console.error('✖ Validation failed:', result.errors);
  console.log('💡 Suggestions:', result.suggestions);
}

// Auto-fix MV2 → MV3 migration issues
const mv2Manifest = {
  manifest_version: 2,
  name: 'Legacy Extension',
  version: '1.0.0',
  browser_action: { default_popup: 'popup.html' },
  background: { scripts: ['bg.js'] },
  permissions: ['storage', 'https://*.google.com/*']
};

const fixedManifest = fixManifest(mv2Manifest);
console.log('Fixed manifest:', JSON.stringify(fixedManifest, null, 2));
```

## Utilities & Modules

| Module | Description |
|--------|-------------|
| `validateManifest(manifest)` | Validates a manifest.json object for MV3 compliance |
| `fixManifest(manifest)` | Auto-fixes common MV2 → MV3 migration issues |
| `ValidationResult` | Interface containing validation results |

## Validation Rules

The validator checks for:

| Category | Rules |
|----------|-------|
| **Required Fields** | `manifest_version` (must be 3), `name`, `version` |
| **Icons** | Must include 16x16, 48x48, and 128x128 sizes |
| **Background** | MV3 requires `service_worker`, not `scripts` |
| **Permissions** | Validates API permissions; detects host permissions in wrong field |
| **Host Permissions** | Must use URL patterns (`https://*/*`, `<all_urls>`) |
| **Actions** | Detects deprecated `browser_action` / `page_action` |
| **Content Scripts** | Validates `matches` array presence |
| **Web Accessible Resources** | Must use MV3 object format with `resources` and `matches` |
| **CSP** | Must be an object, not a string |

## API Reference

### `validateManifest(manifest: any): ValidationResult`

Validates a Chrome Extension manifest object for Manifest V3 compliance.

**Parameters:**
- `manifest` - The parsed manifest.json object

**Returns:** `ValidationResult`

### `fixManifest(manifest: any): any`

Auto-fixes common MV2 → MV3 migration issues:
- Renames `browser_action` to `action`
- Renames `background.scripts` to `background.service_worker`
- Moves host permissions from `permissions` to `host_permissions`

**Parameters:**
- `manifest` - The manifest.json object to fix

**Returns:** Fixed manifest object

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: string[];
}
```

| Property | Type | Description |
|----------|------|-------------|
| `valid` | `boolean` | Whether the manifest passes all validation rules |
| `errors` | `string[]` | Array of critical errors that cause validation failure |
| `suggestions` | `string[]` | Actionable suggestions to fix issues |

## Project Structure

```
webext-toolkit/
├── src/
│   ├── index.ts          # Core validation and fix logic
│   ├── index.test.ts     # Test suite
│   └── cli.ts            # Command-line interface
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── LICENSE               # MIT License
└── README.md             # This file
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)
