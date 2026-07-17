import React, { useMemo, useState } from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Text from '@splunk/react-ui/Text';
import Select from '@splunk/react-ui/Select';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Tree from '@splunk/react-ui/Tree';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import TaxonomyTreeItem from '../components/taxonomy/TaxonomyTreeItem';
import TaxonomyDetailPanel from '../components/taxonomy/TaxonomyDetailPanel';
import {
    taxonomyTree,
    taxonomyDomains,
    filterTree,
    getNode,
} from '../services/taxonomyService';

const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
    gap: ${variables.spacingLarge};
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const Toolbar = styled.div`
    display: flex;
    gap: ${variables.spacingMedium};
    flex-wrap: wrap;
    margin-bottom: ${variables.spacingMedium};

    > * {
        min-width: 220px;
    }
`;

const TreePanel = styled.div`
    border: 1px solid ${variables.borderColor};
    border-radius: 4px;
    padding: ${variables.spacingMedium};
    max-height: 70vh;
    overflow: auto;
`;

const DetailPanel = styled.div`
    border: 1px solid ${variables.borderColor};
    border-radius: 4px;
    padding: ${variables.spacingMedium};
    position: sticky;
    top: 0;
    max-height: 70vh;
    overflow: auto;
`;

function TaxonomyPage(): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [domain, setDomain] = useState('');
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

    const visibleTree = useMemo(() => filterTree(taxonomyTree, query, domain), [query, domain]);
    const selectedNode = selectedCode ? getNode(selectedCode) ?? null : null;

    const handleToggleExpansion = (code: string): void => {
        setExpandedCodes((previous) => {
            const next = new Set(previous);
            if (next.has(code)) {
                next.delete(code);
            } else {
                next.add(code);
            }
            return next;
        });
    };

    return (
        <div>
            <Heading level={2}>Taxonomy Explorer</Heading>
            <P>
                Browse the LATCH TAX07 taxonomy: domains, groups and current instance records. Search
                or filter by domain, then select a record to see its full detail.
            </P>
            <Toolbar>
                <ControlGroup label="Search" labelPosition="left" hideLabel>
                    <Text
                        placeholder="Search code, term or definition"
                        value={query}
                        onChange={(_event, data) => setQuery(data.value)}
                        canClear
                        aria-label="Search taxonomy"
                    />
                </ControlGroup>
                <ControlGroup label="Domain" labelPosition="left" hideLabel>
                    <Select
                        value={domain}
                        onChange={(_event, data) => setDomain(String(data.value))}
                        aria-label="Filter by domain"
                    >
                        <Select.Option label="All domains" value="" />
                        {taxonomyDomains.map((domainName) => (
                            <Select.Option key={domainName} label={domainName} value={domainName} />
                        ))}
                    </Select>
                </ControlGroup>
            </Toolbar>
            <Layout>
                <TreePanel>
                    {visibleTree.length === 0 ? (
                        <Message type="info">
                            <P>No taxonomy records match the current search and filter.</P>
                        </Message>
                    ) : (
                        <Tree aria-label="LATCH taxonomy tree">
                            {visibleTree.map((rootNode) => (
                                <TaxonomyTreeItem
                                    key={rootNode.code}
                                    node={rootNode}
                                    expandedCodes={expandedCodes}
                                    selectedCode={selectedCode}
                                    onToggleExpansion={handleToggleExpansion}
                                    onSelect={setSelectedCode}
                                />
                            ))}
                        </Tree>
                    )}
                </TreePanel>
                <DetailPanel>
                    <TaxonomyDetailPanel node={selectedNode} />
                </DetailPanel>
            </Layout>
        </div>
    );
}

export default TaxonomyPage;
