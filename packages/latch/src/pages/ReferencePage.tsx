import React, { useMemo, useState } from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Text from '@splunk/react-ui/Text';
import Select from '@splunk/react-ui/Select';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import CardLayout from '@splunk/react-ui/CardLayout';
import Card from '@splunk/react-ui/Card';
import Badge from '@splunk/react-ui/Badge';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import { frameworkConcepts, frameworkConceptCategories } from '../services/frameworkConceptService';

const Toolbar = styled.div`
    display: flex;
    gap: ${variables.spacingMedium};
    flex-wrap: wrap;
    margin-bottom: ${variables.spacingMedium};

    > * {
        min-width: 220px;
    }
`;

const Example = styled.p`
    margin-top: ${variables.spacingSmall};
    color: ${variables.contentColorMuted};
    font-size: ${variables.fontSizeSmall};
`;

function ReferencePage(): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return frameworkConcepts.filter((concept) => {
            const matchesCategory = !category || concept.category === category;
            const matchesQuery =
                !needle ||
                `${concept.term} ${concept.category} ${concept.definition} ${concept.example}`
                    .toLowerCase()
                    .includes(needle);
            return matchesCategory && matchesQuery;
        });
    }, [query, category]);

    return (
        <div>
            <Heading level={2}>Glossary</Heading>
            <P>Definitions for the framework terms used across the taxonomy, source catalogue and health checks.</P>
            <Toolbar>
                <ControlGroup label="Search" labelPosition="left" hideLabel>
                    <Text
                        placeholder="Search term or definition"
                        value={query}
                        onChange={(_event, data) => setQuery(data.value)}
                        canClear
                        aria-label="Search glossary"
                    />
                </ControlGroup>
                <ControlGroup label="Category" labelPosition="left" hideLabel>
                    <Select
                        value={category}
                        onChange={(_event, data) => setCategory(String(data.value))}
                        aria-label="Filter by category"
                    >
                        <Select.Option label="All categories" value="" />
                        {frameworkConceptCategories.map((name) => (
                            <Select.Option key={name} label={name} value={name} />
                        ))}
                    </Select>
                </ControlGroup>
            </Toolbar>
            {filtered.length === 0 ? (
                <Message type="info">
                    <P>No glossary terms match the current search and filter.</P>
                </Message>
            ) : (
                <CardLayout gutterSize={16} cardMinWidth={280} wrapCards>
                    {filtered.map((concept) => (
                        <Card key={concept.term} tag="article">
                            <Card.Header>
                                <Badge label={concept.category} />
                                <Heading level={3}>{concept.term}</Heading>
                            </Card.Header>
                            <Card.Body>
                                <P>{concept.definition}</P>
                                <Example>
                                    <strong>Example:</strong> {concept.example}
                                </Example>
                            </Card.Body>
                        </Card>
                    ))}
                </CardLayout>
            )}
        </div>
    );
}

export default ReferencePage;
