import React from 'react';
import layout from '@splunk/react-page/18';
import { SplunkThemeProvider } from '@splunk/themes';
import { defaultTheme, getThemeOptions } from '@splunk/splunk-utils/themes';

import App from './App';
import { APP_DISPLAY_NAME } from './appInfo';

const themeProviderSettings = getThemeOptions(defaultTheme());

layout(
    <SplunkThemeProvider {...themeProviderSettings}>
        <App />
    </SplunkThemeProvider>,
    { pageTitle: `${APP_DISPLAY_NAME} — SIEM onboarding taxonomy`, layout: 'fixed' }
);
