import { describe, it, expect } from 'vitest';
import { validateManifest, fixManifest } from './index';

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

  describe('MV3 Specific Rules', () => {
    const validIcons = { '16': 'icon16.png', '48': 'icon48.png', '128': 'icon128.png' };

    it('should fail if host permissions are in "permissions"', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        permissions: ['tabs', 'https://*.google.com/*']
      };
      const result = validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('host_permissions'))).toBe(true);
    });

    it('should validate correct host_permissions', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        host_permissions: ['https://*.google.com/*']
      };
      const result = validateManifest(manifest);
      expect(result.valid).toBe(true);
    });

    it('should fail if API permissions are in "host_permissions"', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        host_permissions: ['storage']
      };
      const result = validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"storage" is not a valid host permission pattern.');
    });

    it('should detect deprecated browser_action and page_action', () => {
      const manifest1 = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        browser_action: { default_popup: 'popup.html' }
      };
      const manifest2 = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        page_action: { default_popup: 'popup.html' }
      };
      expect(validateManifest(manifest1).valid).toBe(false);
      expect(validateManifest(manifest2).valid).toBe(false);
    });

    it('should validate valid content_scripts', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        content_scripts: [{
          matches: ['<all_urls>'],
          js: ['content.js']
        }]
      };
      expect(validateManifest(manifest).valid).toBe(true);
    });

    it('should fail if content_scripts matches are missing', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        content_scripts: [{
          js: ['content.js']
        }]
      };
      const result = validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('missing a "matches" array'))).toBe(true);
    });

    it('should fail if web_accessible_resources is in MV2 format', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        web_accessible_resources: ['image.png']
      };
      const result = validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('should be an object in MV3'))).toBe(true);
    });

    it('should validate MV3 web_accessible_resources format', () => {
      const manifest = {
        manifest_version: 3,
        name: 'Test Ext',
        version: '1.0',
        icons: validIcons,
        web_accessible_resources: [{
          resources: ['image.png'],
          matches: ['<all_urls>']
        }]
      };
      expect(validateManifest(manifest).valid).toBe(true);
    });
  });

  describe('fixManifest', () => {
    it('should rename browser_action to action', () => {
      const manifest = {
        browser_action: { default_popup: 'popup.html' }
      };
      const fixed = fixManifest(manifest);
      expect(fixed.action).toEqual({ default_popup: 'popup.html' });
      expect(fixed.browser_action).toBeUndefined();
    });

    it('should rename background.scripts to background.service_worker', () => {
      const manifest = {
        background: {
          scripts: ['background.js', 'other.js']
        }
      };
      const fixed = fixManifest(manifest);
      expect(fixed.background.service_worker).toBe('background.js');
      expect(fixed.background.scripts).toBeUndefined();
    });

    it('should move host permissions from permissions to host_permissions', () => {
      const manifest = {
        permissions: ['storage', 'https://*.google.com/*', '<all_urls>']
      };
      const fixed = fixManifest(manifest);
      expect(fixed.permissions).toEqual(['storage']);
      expect(fixed.host_permissions).toContain('https://*.google.com/*');
      expect(fixed.host_permissions).toContain('<all_urls>');
    });

    it('should handle all fixes together and result in a valid manifest', () => {
      const manifest = {
        manifest_version: 2,
        name: 'Test Ext',
        version: '1.0',
        icons: { '16': 'icon16.png', '48': 'icon48.png', '128': 'icon128.png' },
        browser_action: { default_popup: 'popup.html' },
        background: { scripts: ['bg.js'] },
        permissions: ['storage', 'https://*.google.com/*']
      };
      
      let fixed = fixManifest(manifest);
      // Manually fix manifest_version for validation
      fixed.manifest_version = 3;
      
      const result = validateManifest(fixed);
      expect(result.valid).toBe(true);
      expect(fixed.action).toBeDefined();
      expect(fixed.background.service_worker).toBe('bg.js');
      expect(fixed.host_permissions).toContain('https://*.google.com/*');
      expect(fixed.permissions).toEqual(['storage']);
    });
  });
});
