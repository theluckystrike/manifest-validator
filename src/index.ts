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
    manifest.permissions.forEach((p: string) => {
      if (!validPermissions.includes(p)) {
        errors.push(`Unknown permission: "${p}".`);
        suggestions.push(`Check the spelling of "${p}".`);
      }
    });
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
