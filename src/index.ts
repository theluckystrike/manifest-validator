export interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: string[];
}

export function validateManifest(manifest: any): ValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Required fields
  if (!manifest.manifest_version) {
    errors.push('Missing "manifest_version".');
    suggestions.push('Add "manifest_version": 3 to your manifest.json.');
  } else if (manifest.manifest_version !== 3) {
    errors.push(`Invalid "manifest_version": ${manifest.manifest_version}. MV3 is required.`);
    suggestions.push('Set "manifest_version": 3.');
  }

  if (!manifest.name) errors.push('Missing "name".');
  if (!manifest.version) errors.push('Missing "version".');

  // Icons
  if (manifest.icons) {
    const sizes = Object.keys(manifest.icons);
    if (!sizes.includes('16') || !sizes.includes('48') || !sizes.includes('128')) {
      suggestions.push('Include 16x16, 48x48, and 128x128 icons for the Chrome Web Store.');
    }
  } else {
    errors.push('Missing "icons".');
  }

  // Background / Service Worker
  if (manifest.background) {
    if (manifest.background.scripts) {
      errors.push('MV3 uses "service_worker", not "scripts" in "background".');
      suggestions.push('Replace "scripts" with "service_worker": "background.js" (or your filename).');
    }
    if (!manifest.background.service_worker) {
      errors.push('MV3 background requires a "service_worker".');
    }
  }

  // Permissions
  const validPermissions = [
    'activeTab', 'alarms', 'background', 'bookmarks', 'browsingData', 'clipboardRead',
    'clipboardWrite', 'contentSettings', 'contextMenus', 'cookies', 'debugger',
    'declarativeContent', 'declarativeNetRequest', 'declarativeNetRequestFeedback',
    'declarativeNetRequestWithHostAccess', 'desktopCapture', 'documentScan',
    'downloads', 'downloads.open', 'downloads.shelf', 'enterprise.deviceAttributes',
    'enterprise.hardwarePlatform', 'enterprise.networkingAttributes', 'enterprise.platformKeys',
    'experimental', 'fileBrowserHandler', 'fileSystemProvider', 'fontSettings',
    'gcm', 'geolocation', 'history', 'identity', 'idle', 'loginState',
    'management', 'nativeMessaging', 'notifications', 'offscreen', 'pageCapture',
    'platformKeys', 'power', 'printerProvider', 'printing', 'printingMetrics',
    'privacy', 'processes', 'proxy', 'runtime', 'scripting', 'search', 'sessions',
    'sidePanel', 'storage', 'system.cpu', 'system.display', 'system.memory',
    'system.storage', 'tabCapture', 'tabGroups', 'tabs', 'topSites', 'tts',
    'ttsEngine', 'unlimitedStorage', 'vpnProvider', 'wallpaper', 'webNavigation',
    'webRequest', 'webRequestBlocking'
  ];

  if (manifest.permissions) {
    if (!Array.isArray(manifest.permissions)) {
      errors.push('"permissions" must be an array.');
    } else {
      manifest.permissions.forEach((p: string) => {
        if (p.includes('://') || p === '<all_urls>') {
          errors.push(`Host permission "${p}" must be in "host_permissions", not "permissions".`);
          suggestions.push(`Move "${p}" from "permissions" to "host_permissions".`);
        } else if (!validPermissions.includes(p)) {
          errors.push(`Unknown permission: "${p}".`);
          suggestions.push(`Check the spelling of "${p}".`);
        }
      });
    }
  }

  // Host Permissions
  if (manifest.host_permissions) {
    if (!Array.isArray(manifest.host_permissions)) {
      errors.push('"host_permissions" must be an array.');
    } else {
      manifest.host_permissions.forEach((p: string) => {
        if (!p.includes('://') && p !== '<all_urls>') {
          errors.push(`"${p}" is not a valid host permission pattern.`);
          suggestions.push(`Move "${p}" to "permissions" if it is an API permission.`);
        }
      });
    }
  }

  // Action
  if (manifest.browser_action) {
    errors.push('"browser_action" is deprecated in MV3.');
    suggestions.push('Replace "browser_action" with "action".');
  }
  if (manifest.page_action) {
    errors.push('"page_action" is deprecated in MV3.');
    suggestions.push('Replace "page_action" with "action".');
  }

  // Content Scripts
  if (manifest.content_scripts) {
    if (!Array.isArray(manifest.content_scripts)) {
      errors.push('"content_scripts" must be an array.');
    } else {
      manifest.content_scripts.forEach((script: any, index: number) => {
        if (!script.matches || !Array.isArray(script.matches)) {
          errors.push(`"content_scripts[${index}]" is missing a "matches" array.`);
        }
      });
    }
  }

  // Web Accessible Resources
  if (manifest.web_accessible_resources) {
    if (!Array.isArray(manifest.web_accessible_resources)) {
      errors.push('"web_accessible_resources" must be an array.');
    } else {
      manifest.web_accessible_resources.forEach((resource: any, index: number) => {
        if (typeof resource === 'string') {
          errors.push(`"web_accessible_resources[${index}]" should be an object in MV3.`);
          suggestions.push('Update to: { "resources": ["..."], "matches": ["..."] }.');
        } else if (!resource.resources || !resource.matches) {
          errors.push(`"web_accessible_resources[${index}]" must include "resources" and "matches".`);
        }
      });
    }
  }

  // CSP
  if (manifest.content_security_policy) {
    if (typeof manifest.content_security_policy === 'string') {
      errors.push('MV3 CSP must be an object, not a string.');
      suggestions.push('Use "content_security_policy": { "extension_pages": "..." }.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions
  };
}

export function fixManifest(manifest: any): any {
  const fixed = JSON.parse(JSON.stringify(manifest));

  // 1. Rename browser_action to action
  if (fixed.browser_action) {
    fixed.action = fixed.browser_action;
    delete fixed.browser_action;
  }

  // 2. Rename background.scripts to background.service_worker
  if (fixed.background && fixed.background.scripts && Array.isArray(fixed.background.scripts)) {
    if (fixed.background.scripts.length > 0) {
      fixed.background.service_worker = fixed.background.scripts[0];
    }
    delete fixed.background.scripts;
  }

  // 3. Move URL match patterns from permissions to host_permissions
  if (fixed.permissions && Array.isArray(fixed.permissions)) {
    const hostPermissions = fixed.host_permissions || [];
    const newPermissions: string[] = [];

    fixed.permissions.forEach((p: string) => {
      if (p.includes('://') || p === '<all_urls>') {
        if (!hostPermissions.includes(p)) {
          hostPermissions.push(p);
        }
      } else {
        newPermissions.push(p);
      }
    });

    fixed.permissions = newPermissions;
    if (hostPermissions.length > 0) {
      fixed.host_permissions = hostPermissions;
    }
    if (fixed.permissions.length === 0) {
      delete fixed.permissions;
    }
  }

  return fixed;
}
