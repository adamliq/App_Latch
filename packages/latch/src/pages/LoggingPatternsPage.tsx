import React, { useMemo, useRef, useState } from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Text from '@splunk/react-ui/Text';
import Select from '@splunk/react-ui/Select';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Table from '@splunk/react-ui/Table';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import DefinitionList from '@splunk/react-ui/DefinitionList';
import ScreenReaderContent from '@splunk/react-ui/ScreenReaderContent';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import { loggingPatterns, loggingPatternCategories, loggingPatternDestinations } from '../services/loggingPatternService';
import type { LoggingPatternRecord } from '../types/loggingPattern';
import { renderDefinitionRows } from '../components/DefinitionRows';

const Toolbar = styled.div`
    display: flex;
    gap: ${variables.spacingMedium};
    flex-wrap: wrap;
    margin-bottom: ${variables.spacingMedium};

    > * {
        min-width: 220px;
    }
`;

function LoggingPatternsPage(): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [destination, setDestination] = useState('');
    const [selected, setSelected] = useState<LoggingPatternRecord | null>(null);
    const detailTriggerRef = useRef<HTMLElement | null>(null);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return loggingPatterns.filter((row) => {
            const matchesQuery =
                !needle ||
                `${row.Pattern} ${row['Source data']} ${row['Source mechanism']}`.toLowerCase().includes(needle);
            const matchesCategory = !category || row.Category === category;
            const matchesDestination = !destination || row.Destination === destination;
            return matchesQuery && matchesCategory && matchesDestination;
        });
    }, [query, category, destination]);

    return (
        <div>
            <Heading level={2}>Logging Patterns</Heading>
            <P>
                Approved reusable collection topologies: how a class of data source is collected,
                which transport and destination is used, and what is required on the source
                platform before onboarding.
            </P>
            <Toolbar>
                <ControlGroup label="Search" labelPosition="left" hideLabel>
                    <Text
                        placeholder="Search pattern or source data"
                        value={query}
                        onChange={(_event, data) => setQuery(data.value)}
                        canClear
                        aria-label="Search logging patterns"
                    />
                </ControlGroup>
                <ControlGroup label="Category" labelPosition="left" hideLabel>
                    <Select
                        value={category}
                        onChange={(_event, data) => setCategory(String(data.value))}
                        aria-label="Filter by category"
                    >
                        <Select.Option label="All categories" value="" />
                        {loggingPatternCategories.map((name) => (
                            <Select.Option key={name} label={name} value={name} />
                        ))}
                    </Select>
                </ControlGroup>
                <ControlGroup label="Destination" labelPosition="left" hideLabel>
                    <Select
                        value={destination}
                        onChange={(_event, data) => setDestination(String(data.value))}
                        aria-label="Filter by destination"
                    >
                        <Select.Option label="All destinations" value="" />
                        {loggingPatternDestinations.map((name) => (
                            <Select.Option key={name} label={name} value={name} />
                        ))}
                    </Select>
                </ControlGroup>
            </Toolbar>
            {filtered.length === 0 ? (
                <Message type="info">
                    <P>No logging patterns match the current search and filters.</P>
                </Message>
            ) : (
                <Table stripeRows>
                    <Table.Caption side="bottom">
                        <ScreenReaderContent>Logging pattern catalogue</ScreenReaderContent>
                    </Table.Caption>
                    <Table.Head>
                        <Table.HeadCell>Pattern ID</Table.HeadCell>
                        <Table.HeadCell>Pattern</Table.HeadCell>
                        <Table.HeadCell>Category</Table.HeadCell>
                        <Table.HeadCell>Transport</Table.HeadCell>
                        <Table.HeadCell>Destination</Table.HeadCell>
                        <Table.HeadCell>Details</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {filtered.map((row) => (
                            <Table.Row key={row['Pattern ID']}>
                                <Table.Cell>{row['Pattern ID']}</Table.Cell>
                                <Table.Cell>{row.Pattern}</Table.Cell>
                                <Table.Cell>{row.Category}</Table.Cell>
                                <Table.Cell>{row.Transport}</Table.Cell>
                                <Table.Cell>{row.Destination}</Table.Cell>
                                <Table.Cell>
                                    <Button
                                        appearance="subtle"
                                        label="View details"
                                        onClick={(event) => {
                                            detailTriggerRef.current = event.currentTarget;
                                            setSelected(row);
                                        }}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
            {selected && (
                <Modal
                    open
                    onRequestClose={() => setSelected(null)}
                    returnFocus={detailTriggerRef}
                    style={{ width: '720px' }}
                >
                    <Modal.Header title={selected.Pattern} subtitle={selected['Pattern ID']} />
                    <Modal.Body>
                        <DefinitionList layout="auto" termWidth="220px">
                            {renderDefinitionRows([
                                ['Source data', selected['Source data']],
                                ['Category', selected.Category],
                                ['Direction', selected.Direction],
                                ['Source mechanism', selected['Source mechanism']],
                                ['Collection tier / runtime', selected['Collection tier / runtime']],
                                ['Transport', selected.Transport],
                                ['Destination', selected.Destination],
                                ['Required app / add-on', selected['Required app / add-on']],
                                ['Port / firewall requirements', selected['Port / firewall requirements']],
                                ['Authentication requirements', selected['Authentication requirements']],
                                ['Source platform requirements', selected['Source platform requirements']],
                            ])}
                        </DefinitionList>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
}

export default LoggingPatternsPage;
