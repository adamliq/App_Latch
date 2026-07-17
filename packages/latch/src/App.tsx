import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Heading from '@splunk/react-ui/Heading';
import { variables } from '@splunk/themes';

import AppNav from './components/AppNav';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoadingFallback from './components/PageLoadingFallback';
import NotFoundPage from './pages/NotFoundPage';
import { appRoutes } from './routes';
import { APP_DISPLAY_NAME } from './appInfo';

const AppShell = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100%;
`;

const AppHeader = styled.header`
    padding: ${variables.spacingMedium} ${variables.spacingLarge} 0;
    border-bottom: 1px solid ${variables.borderColor};
    background: ${variables.backgroundColorPage};
`;

const AppMain = styled.main`
    flex: 1;
    padding: ${variables.spacingLarge};
`;

const SkipLink = styled.a`
    position: absolute;
    left: -9999px;
    top: auto;
    z-index: ${variables.zindexPopover};

    &:focus {
        left: ${variables.spacingMedium};
        top: ${variables.spacingMedium};
        padding: ${variables.spacingSmall} ${variables.spacingMedium};
        background: ${variables.backgroundColorPage};
        border: 1px solid ${variables.borderColorStrong};
    }
`;

function App(): React.JSX.Element {
    return (
        <HashRouter>
            <AppShell>
                <SkipLink href="#main-content">Skip to main content</SkipLink>
                <AppHeader>
                    <Heading level={1}>{APP_DISPLAY_NAME}</Heading>
                    <AppNav />
                </AppHeader>
                <AppMain id="main-content" tabIndex={-1}>
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoadingFallback />}>
                            <Routes>
                                {appRoutes.map(({ path, element: Element }) => (
                                    <Route key={path} path={path} element={<Element />} />
                                ))}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </Suspense>
                    </ErrorBoundary>
                </AppMain>
            </AppShell>
        </HashRouter>
    );
}

export default App;
