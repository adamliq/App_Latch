import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TaxonomyPage from './TaxonomyPage';

describe('TaxonomyPage', () => {
    it('shows a prompt to select a record before anything is selected', () => {
        render(<TaxonomyPage />);
        expect(screen.getByText(/Select a record in the taxonomy tree/i)).toBeInTheDocument();
    });

    it('filters the tree by search text, hiding unrelated top-level domains', async () => {
        const user = userEvent.setup();
        render(<TaxonomyPage />);

        const tree = screen.getByRole('tree', { name: 'LATCH taxonomy tree' });
        expect(within(tree).getAllByText(/TAX-0\d/).length).toBeGreaterThan(1);

        await user.type(screen.getByLabelText('Search taxonomy'), 'zzz-no-such-term-zzz');

        expect(screen.getByText(/No taxonomy records match/i)).toBeInTheDocument();
    });

    it('selecting a taxonomy node shows its detail panel with a matching heading', async () => {
        const user = userEvent.setup();
        render(<TaxonomyPage />);

        // The first root domain button is always rendered; clicking it selects it.
        const tree = screen.getByRole('tree', { name: 'LATCH taxonomy tree' });
        const firstNodeButton = within(tree).getAllByRole('button', { name: /TAX-01/ })[0];
        await user.click(firstNodeButton);

        expect(await screen.findByRole('heading', { level: 3 })).toBeInTheDocument();
    });
});
