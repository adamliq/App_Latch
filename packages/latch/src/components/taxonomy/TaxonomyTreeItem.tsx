import React from 'react';
import Tree from '@splunk/react-ui/Tree';
import Button from '@splunk/react-ui/Button';
import ChevronRight from '@splunk/react-icons/ChevronRight';
import ChevronDown from '@splunk/react-icons/ChevronDown';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import type { TaxonomyTreeNode } from '../../types/taxonomy';
import { getItemDisplayCode } from '../../services/taxonomyService';

const ItemContent = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    gap: ${variables.spacingXSmall};
    padding: 2px 0;
    background: ${(props) => (props.$selected ? variables.backgroundColorSection : 'transparent')};
`;

const Code = styled.span`
    font-family: monospace;
    font-weight: bold;
    color: ${variables.contentColorAccent};
    white-space: nowrap;
`;

const Term = styled.span`
    color: ${variables.contentColorDefault};
`;

interface TaxonomyTreeItemProps {
    node: TaxonomyTreeNode;
    expandedCodes: Set<string>;
    selectedCode: string | null;
    onToggleExpansion: (code: string) => void;
    onSelect: (code: string) => void;
}

/** Recursively renders one taxonomy node (and its children) as SUIT Tree.Items. */
function TaxonomyTreeItem({
    node,
    expandedCodes,
    selectedCode,
    onToggleExpansion,
    onSelect,
}: TaxonomyTreeItemProps): React.JSX.Element {
    const hasChildren = node.children.length > 0;
    const expanded = expandedCodes.has(node.code);
    const displayCode = getItemDisplayCode(node);

    return (
        <Tree.Item
            id={node.code}
            expanded={hasChildren ? expanded : undefined}
            onToggleExpansion={hasChildren ? () => onToggleExpansion(node.code) : undefined}
            content={
                <ItemContent $selected={selectedCode === node.code}>
                    {hasChildren && (
                        <Button
                            appearance="subtle"
                            icon={expanded ? <ChevronDown /> : <ChevronRight />}
                            aria-label={expanded ? `Collapse ${node.term}` : `Expand ${node.term}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                onToggleExpansion(node.code);
                            }}
                        />
                    )}
                    <Button
                        appearance="subtle"
                        onClick={() => onSelect(node.code)}
                        style={{ textAlign: 'left', flex: 1 }}
                    >
                        {displayCode && <Code>{displayCode}</Code>}
                        {' '}
                        <Term>{node.term}</Term>
                    </Button>
                </ItemContent>
            }
        >
            {hasChildren &&
                node.children.map((child) => (
                    <TaxonomyTreeItem
                        key={child.code}
                        node={child}
                        expandedCodes={expandedCodes}
                        selectedCode={selectedCode}
                        onToggleExpansion={onToggleExpansion}
                        onSelect={onSelect}
                    />
                ))}
        </Tree.Item>
    );
}

export default TaxonomyTreeItem;
