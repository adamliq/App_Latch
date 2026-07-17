import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

describe('App', () => {
    afterEach(() => {
        window.location.hash = '';
    });

    it('renders the Home page by default with an accessible page heading', async () => {
        render(<App />);
        expect(await screen.findByRole('heading', { level: 1, name: 'Latch' })).toBeInTheDocument();
        expect(
            await screen.findByRole('heading', { level: 2, name: /SIEM onboarding and assurance reference/i })
        ).toBeInTheDocument();
    });

    it('navigates to the Taxonomy Explorer page via the nav and updates the heading', async () => {
        const user = userEvent.setup();
        render(<App />);
        await screen.findByRole('heading', { level: 2, name: /SIEM onboarding/i });

        await user.click(screen.getByRole('tab', { name: 'Taxonomy Explorer' }));

        expect(await screen.findByRole('heading', { level: 2, name: 'Taxonomy Explorer' })).toBeInTheDocument();
    });

    it('keeps the browser back button working across in-app navigation', async () => {
        const user = userEvent.setup();
        render(<App />);
        await screen.findByRole('heading', { level: 2, name: /SIEM onboarding/i });

        await user.click(screen.getByRole('tab', { name: 'Glossary' }));
        expect(await screen.findByRole('heading', { level: 2, name: 'Glossary' })).toBeInTheDocument();

        window.history.back();

        expect(await screen.findByRole('heading', { level: 2, name: /SIEM onboarding/i })).toBeInTheDocument();
    });

    it('shows a not-found message for an unknown in-app route', async () => {
        window.location.hash = '#/this-route-does-not-exist';
        render(<App />);
        expect(await screen.findByRole('heading', { level: 2, name: 'Page not found' })).toBeInTheDocument();
    });

    it('provides a skip link that targets the main content region', async () => {
        render(<App />);
        const skipLink = await screen.findByRole('link', { name: 'Skip to main content' });
        expect(skipLink).toHaveAttribute('href', '#main-content');
    });
});
