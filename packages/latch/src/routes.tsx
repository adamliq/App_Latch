import React, { lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const TaxonomyPage = lazy(() => import('./pages/TaxonomyPage'));
const SourceCataloguePage = lazy(() => import('./pages/SourceCataloguePage'));
const LoggingPatternsPage = lazy(() => import('./pages/LoggingPatternsPage'));
const HealthChecksPage = lazy(() => import('./pages/HealthChecksPage'));
const ReferencePage = lazy(() => import('./pages/ReferencePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export interface AppRoute {
    path: string;
    tabId: string;
    label: string;
    element: React.ComponentType;
}

/**
 * Single source of truth for top-level navigation. Each entry drives both
 * the router (routes.tsx consumers) and the AppNav tab bar, so a page can
 * never be reachable from one but not the other.
 */
export const appRoutes: AppRoute[] = [
    { path: '/', tabId: 'home', label: 'Home', element: HomePage },
    { path: '/taxonomy', tabId: 'taxonomy', label: 'Taxonomy Explorer', element: TaxonomyPage },
    { path: '/catalogue', tabId: 'catalogue', label: 'Source Catalogue', element: SourceCataloguePage },
    { path: '/patterns', tabId: 'patterns', label: 'Logging Patterns', element: LoggingPatternsPage },
    { path: '/health', tabId: 'health', label: 'Health Checks', element: HealthChecksPage },
    { path: '/reference', tabId: 'reference', label: 'Glossary', element: ReferencePage },
    { path: '/about', tabId: 'about', label: 'About', element: AboutPage },
];
