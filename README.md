# manifest-validator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-v1.0.0-cb3837?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@theluckystrike/manifest-validator)
[![MIT](https://img.shields.io/badge/License-MIT-969464?style=flat-square)](#license)

Validate `manifest.json` files for Chrome Extension Manifest V3 compliance and receive actionable suggestions for identified errors.

## Installation

```bash
npm install -g @theluckystrike/manifest-validator
```

## Usage

### CLI

Point the tool at your `manifest.json` file:

```bash
manifest-validator ./manifest.json
```

### Programmatic API

```typescript
import { validateManifest, ValidationResult } from '@theluckystrike/manifest-validator';

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
```

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

## Chrome Extension Guide

For deeper learning about building extensions, refer to the [Chrome Extension Guide](https://developer.chrome.com/docs/extensions/mv3).

## License

MIT

---

Built by [theluckystrike](https://github.com/theluckystrike) | [zovo.one](https://zovo.one)
