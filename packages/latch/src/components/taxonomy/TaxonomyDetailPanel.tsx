import React from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Badge from '@splunk/react-ui/Badge';
import DefinitionList from '@splunk/react-ui/DefinitionList';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import type { TaxonomyNode } from '../../types/taxonomy';
import { getItemDisplayCode, getTaxonomyPath } from '../../services/taxonomyService';
import { renderDefinitionRows } from '../DefinitionRows';

const Breadcrumb = styled.nav`
    margin-bottom: ${variables.spacingMedium};
    font-size: ${variables.fontSizeSmall};
    color: ${variables.contentColorMuted};
`;

const BadgeRow = styled.div`
    display: flex;
    gap: ${variables.spacingXSmall};
    flex-wrap: wrap;
    margin: ${variables.spacingSmall} 0 ${variables.spacingMedium};
`;

interface TaxonomyDetailPanelProps {
    node: TaxonomyNode | null;
}

function TaxonomyDetailPanel({ node }: TaxonomyDetailPanelProps): React.JSX.Element {
    if (!node) {
        return (
            <Message type="info">
                <P>Select a record in the taxonomy tree to see its details here.</P>
            </Message>
        );
    }

    const path = getTaxonomyPath(node);
    const displayCode = getItemDisplayCode(node);

    const metadataRows: Array<[string, React.ReactNode]> = [];
    if (node.entityType) metadataRows.push(['Entity type', node.entityType]);
    if (node.owner) metadataRows.push(['Owner', node.owner]);
    if (node.primaryKey) metadataRows.push(['Primary key', node.primaryKey]);
    if (node.mandatoryAttributes) metadataRows.push(['Mandatory attributes', node.mandatoryAttributes]);
    if (node.relationshipRule) metadataRows.push(['Relationship rule', node.relationshipRule]);
    if (node.sourceWorksheet) metadataRows.push(['Source worksheet', node.sourceWorksheet]);
    if (node.notes) metadataRows.push(['Notes', node.notes]);

    const fieldRows: Array<[string, React.ReactNode]> = Object.entries(node.fields || {}).map(
        ([key, value]) => [key, String(value)]
    );

    return (
        <section aria-labelledby="taxonomy-detail-heading">
            {path.length > 0 && (
                <Breadcrumb aria-label="Taxonomy path">
                    {path.map((ancestor, index) => (
                        <React.Fragment key={ancestor.code}>
                            {index > 0 && ' › '}
                            <span>
                                {ancestor.code} — {ancestor.term}
                            </span>
                        </React.Fragment>
                    ))}
                </Breadcrumb>
            )}
            <Heading level={3} id="taxonomy-detail-heading">
                {displayCode ? `${displayCode} — ${node.term}` : node.term}
            </Heading>
            <BadgeRow>
                <Badge label={node.nodeType} />
                {node.domain && <Badge label={node.domain} />}
                {node.status && <Badge label={node.status} />}
                {node.nodeType === 'group' && <Badge label={`${node.entryCount} records`} />}
            </BadgeRow>
            {node.definition && <P>{node.definition}</P>}
            {metadataRows.length > 0 && (
                <DefinitionList layout="auto" termWidth="220px">
                    {renderDefinitionRows(metadataRows)}
                </DefinitionList>
            )}
            {fieldRows.length > 0 && (
                <>
                    <Heading level={4}>Record fields</Heading>
                    <DefinitionList layout="auto" termWidth="220px">
                        {renderDefinitionRows(fieldRows)}
                    </DefinitionList>
                </>
            )}
        </section>
    );
}

export default TaxonomyDetailPanel;
