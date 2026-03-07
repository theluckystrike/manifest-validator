import { describe, it, expect } from 'vitest';
import { validateManifest } from './index';

describe('manifest-validator', () => {
  it('should validate a correct MV3 manifest', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Ext',
      version: '1.0',
      icons: { '16': 'icon16.png', '48': 'icon48.png', '128': 'icon128.png' }
    };
    const result = validateManifest(manifest);
    expect(result.valid).toBe(true);
  });

  it('should fail if manifest_version is not 3', () => {
    const manifest = {
      manifest_version: 2,
      name: 'Test Ext',
      version: '1.0'
    };
    const result = validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid "manifest_version": 2. MV3 is required.');
  });

  it('should detect invalid permissions', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Ext',
      version: '1.0',
      icons: { '16': 'icon16.png', '48': 'icon48.png', '128': 'icon128.png' },
      permissions: ['tabs', 'unknownPermission']
    };
    const result = validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Unknown permission: "unknownPermission".');
  });
});
