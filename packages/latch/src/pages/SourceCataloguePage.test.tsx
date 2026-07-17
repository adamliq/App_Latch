import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SourceCataloguePage from './SourceCataloguePage';
import { sourceCatalogue } from '../services/sourceCatalogueService';

describe('SourceCataloguePage', () => {
    it('renders the first page of catalogued sources with a paginator, since the full list does not fit on one page', () => {
        render(<SourceCataloguePage />);
        const table = screen.getByRole('table', { name: 'SIEM source catalogue' });
        expect(table).toBeInTheDocument();
        expect(screen.getByText(sourceCatalogue[0].dataSource)).toBeInTheDocument();
        expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
        expect(screen.getByRole('navigation', { name: /pag/i })).toBeInTheDocument();
    });

    it('filters rows by search text', async () => {
        const user = userEvent.setup();
        render(<SourceCataloguePage />);

        await user.type(screen.getByLabelText('Search source catalogue'), 'zzz-no-such-source-zzz');

        expect(screen.getByText(/No sources match the current search and filters/i)).toBeInTheDocument();
    });

    it('opens a detail dialog with the record fields when "View details" is activated, and closes on request', async () => {
        const user = userEvent.setup();
        render(<SourceCataloguePage />);

        const [firstDetailButton] = screen.getAllByRole('button', { name: 'View details' });
        await user.click(firstDetailButton);

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('Expected events')).toBeInTheDocument();

        const closeButton = within(dialog).getByRole('button', { name: /close/i });
        await user.click(closeButton);

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
});
