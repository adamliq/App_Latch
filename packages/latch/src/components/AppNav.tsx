import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabBar from '@splunk/react-ui/TabBar';
import { appRoutes } from '../routes';

/**
 * Primary in-app navigation. Wraps SUIT's TabBar (which already implements
 * the WAI-ARIA tablist keyboard and focus behavior) as a controlled
 * component driven by the router, so tab selection and the URL never
 * disagree and the browser back/forward buttons keep working.
 */
function AppNav(): React.JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    const activeRoute =
        appRoutes.find((route) => route.path !== '/' && location.pathname.startsWith(route.path)) ??
        appRoutes[0];

    return (
        <TabBar
            activeTabId={activeRoute.tabId}
            onChange={(_event, data) => {
                const target = appRoutes.find((route) => route.tabId === data.selectedTabId);
                if (target) {
                    navigate(target.path);
                }
            }}
            aria-label="Latch app navigation"
        >
            {appRoutes.map((route) => (
                <TabBar.Tab key={route.tabId} tabId={route.tabId} label={route.label} />
            ))}
        </TabBar>
    );
}

export default AppNav;
