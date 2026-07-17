import React from 'react';
import { render, screen } from '@testing-library/react';

import ErrorBoundary from './ErrorBoundary';

function Boom(): React.JSX.Element {
    throw new Error('boom');
}

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>All good</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('All good')).toBeInTheDocument();
    });

    it('renders a neutral, accessible fallback message instead of crashing the app', () => {
        // React logs the caught error to the console by default; suppress the
        // noisy expected output for this one intentional-throw test.
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Something went wrong displaying this page/i)).toBeInTheDocument();
        expect(screen.queryByText(/boom/i)).not.toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});
