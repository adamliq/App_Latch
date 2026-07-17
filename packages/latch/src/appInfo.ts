/**
 * Single source of truth for identity/version strings shown in the UI.
 * Keep in sync with splunk-app/latch/default/app.conf and app.manifest —
 * scripts/validate-release.js checks that these stay consistent.
 */
export const APP_DISPLAY_NAME = 'Latch';
export const APP_FOLDER_NAME = 'latch';
export const APP_VERSION = '1.0.0';
export const APP_VENDOR = 'adamliq';
export const APP_DESCRIPTION =
    'Browse the LATCH SIEM onboarding taxonomy, source catalogue, logging patterns and health checks.';
