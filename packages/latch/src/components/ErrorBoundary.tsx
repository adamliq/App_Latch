import React from 'react';
import Message from '@splunk/react-ui/Message';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * Catches rendering errors in a page so one broken view can't blank the
 * whole app shell. Details are kept out of the UI and the console in
 * production; only a neutral, accessible message is shown to the user.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(): void {
        // Intentionally no console output in production; this app has no
        // backend to forward client diagnostics to and must not leak stack
        // traces to end users.
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div role="alert">
                    <Heading level={2}>Something went wrong displaying this page</Heading>
                    <Message type="error">
                        <P>
                            An unexpected error occurred while rendering this view. Try reloading the
                            page. If the problem continues, contact your Splunk administrator.
                        </P>
                    </Message>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
