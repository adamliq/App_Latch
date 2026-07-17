import React from 'react';
import DefinitionList from '@splunk/react-ui/DefinitionList';

/**
 * Renders a flat list of Term/Description pairs as direct DefinitionList
 * children (DefinitionList expects an alternating flat child list, so these
 * cannot be wrapped in a Fragment per pair). Keyed by the term text, which is
 * unique within each list this is used for.
 */
export function renderDefinitionRows(rows: Array<[string, React.ReactNode]>): React.ReactNode[] {
    return rows.flatMap(([term, description]) => [
        <DefinitionList.Term key={`${term}-term`}>{term}</DefinitionList.Term>,
        <DefinitionList.Description key={`${term}-desc`}>{description}</DefinitionList.Description>,
    ]);
}
