import React from 'react';
import { Link } from 'react-router-dom';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Message from '@splunk/react-ui/Message';
import { APP_DISPLAY_NAME } from '../appInfo';

/**
 * Shown for any in-app hash route that doesn't match a page. Keeps
 * navigation graceful instead of rendering a blank panel.
 */
function NotFoundPage(): React.JSX.Element {
    return (
        <div>
            <Heading level={2}>Page not found</Heading>
            <Message type="info">
                <P>
                    That page does not exist in {APP_DISPLAY_NAME}. Use the navigation above, or return to{' '}
                    <Link to="/">Home</Link>.
                </P>
            </Message>
        </div>
    );
}

export default NotFoundPage;
