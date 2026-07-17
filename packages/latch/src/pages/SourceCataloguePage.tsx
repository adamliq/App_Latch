import React, { useMemo, useRef, useState } from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Text from '@splunk/react-ui/Text';
import Select from '@splunk/react-ui/Select';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Table from '@splunk/react-ui/Table';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Paginator from '@splunk/react-ui/Paginator';
import Message from '@splunk/react-ui/Message';
import DefinitionList from '@splunk/react-ui/DefinitionList';
import ScreenReaderContent from '@splunk/react-ui/ScreenReaderContent';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import {
    sourceCatalogue,
    sourceCatalogueCategories,
    sourceCataloguePriorities,
    getEventTypesForSource,
} from '../services/sourceCatalogueService';
import type { SourceCatalogueRecord } from '../types/sourceCatalogue';
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

const PAGE_SIZE = 10;

function SourceCataloguePage(): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<SourceCatalogueRecord | null>(null);
    const detailTriggerRef = useRef<HTMLElement | null>(null);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return sourceCatalogue.filter((row) => {
            const matchesQuery =
                !needle ||
                `${row.dataSource} ${row.category} ${row.subCategory} ${row.useCases}`
                    .toLowerCase()
                    .includes(needle);
            const matchesCategory = !category || row.category === category;
            const matchesPriority = !priority || row.priority === priority;
            return matchesQuery && matchesCategory && matchesPriority;
        });
    }, [query, category, priority]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const selectedEventTypes = selected ? getEventTypesForSource(selected.sourceId) : [];

    return (
        <div>
            <Heading level={2}>Source Catalogue</Heading>
            <P>
                Expected events, use cases, priority and coverage state for each SIEM data source
                covered by this taxonomy.
            </P>
            <Toolbar>
                <ControlGroup label="Search" labelPosition="left" hideLabel>
                    <Text
                        placeholder="Search data source or use case"
                        value={query}
                        onChange={(_event, data) => {
                            setQuery(data.value);
                            setPage(1);
                        }}
                        canClear
                        aria-label="Search source catalogue"
                    />
                </ControlGroup>
                <ControlGroup label="Category" labelPosition="left" hideLabel>
                    <Select
                        value={category}
                        onChange={(_event, data) => {
                            setCategory(String(data.value));
                            setPage(1);
                        }}
                        aria-label="Filter by category"
                    >
                        <Select.Option label="All categories" value="" />
                        {sourceCatalogueCategories.map((name) => (
                            <Select.Option key={name} label={name} value={name} />
                        ))}
                    </Select>
                </ControlGroup>
                <ControlGroup label="Priority" labelPosition="left" hideLabel>
                    <Select
                        value={priority}
                        onChange={(_event, data) => {
                            setPriority(String(data.value));
                            setPage(1);
                        }}
                        aria-label="Filter by priority"
                    >
                        <Select.Option label="All priorities" value="" />
                        {sourceCataloguePriorities.map((name) => (
                            <Select.Option key={name} label={name} value={name} />
                        ))}
                    </Select>
                </ControlGroup>
            </Toolbar>
            {filtered.length === 0 ? (
                <Message type="info">
                    <P>No sources match the current search and filters.</P>
                </Message>
            ) : (
                <>
                    <Table stripeRows>
                        <Table.Caption side="bottom">
                            <ScreenReaderContent>SIEM source catalogue</ScreenReaderContent>
                        </Table.Caption>
                        <Table.Head>
                            <Table.HeadCell>Data source</Table.HeadCell>
                            <Table.HeadCell>Category</Table.HeadCell>
                            <Table.HeadCell>Priority</Table.HeadCell>
                            <Table.HeadCell>Coverage</Table.HeadCell>
                            <Table.HeadCell>Assurance</Table.HeadCell>
                            <Table.HeadCell>Details</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {pageRows.map((row) => (
                                <Table.Row key={row.sourceId}>
                                    <Table.Cell>{row.dataSource}</Table.Cell>
                                    <Table.Cell>{row.category}</Table.Cell>
                                    <Table.Cell>{row.priority}</Table.Cell>
                                    <Table.Cell>{row.coverageState}</Table.Cell>
                                    <Table.Cell>{row.assuranceState}</Table.Cell>
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
                    {totalPages > 1 && (
                        <Paginator
                            current={currentPage}
                            totalPages={totalPages}
                            onChange={(_event, data) => setPage(data.page)}
                        />
                    )}
                </>
            )}
            {selected && (
                <Modal
                    open
                    onRequestClose={() => setSelected(null)}
                    returnFocus={detailTriggerRef}
                    style={{ width: '720px' }}
                >
                    <Modal.Header
                        title={selected.dataSource}
                        subtitle={`${selected.category} — ${selected.subCategory}`}
                    />
                    <Modal.Body>
                        <DefinitionList layout="auto" termWidth="200px">
                            {renderDefinitionRows([
                                ['Expected events', selected.expectedEvents],
                                ['Use cases', selected.useCases],
                                ['Priority', selected.priority],
                                ['Example technologies', selected.exampleTechnologies],
                                ['Coverage state', selected.coverageState],
                                ['Assurance state', selected.assuranceState],
                                ['Minimum required fields', selected.minimumRequiredFields],
                                ['ACSC/ISM control themes', selected.acscIsmControlThemes],
                                ['Validation questions', selected.validationQuestions],
                                ...(selected.note ? [['Note', selected.note] as [string, string]] : []),
                            ])}
                        </DefinitionList>
                        {selectedEventTypes.length > 0 && (
                            <>
                                <Heading level={4}>Required event types</Heading>
                                <Table stripeRows>
                                    <Table.Caption side="bottom">
                                        <ScreenReaderContent>
                                            Event types for {selected.dataSource}
                                        </ScreenReaderContent>
                                    </Table.Caption>
                                    <Table.Head>
                                        <Table.HeadCell>Event category</Table.HeadCell>
                                        <Table.HeadCell>Importance</Table.HeadCell>
                                        <Table.HeadCell>Required event type</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body>
                                        {selectedEventTypes.map((eventType) => (
                                            <Table.Row key={eventType.eventCategory}>
                                                <Table.Cell>{eventType.eventCategory}</Table.Cell>
                                                <Table.Cell>{eventType.importance}</Table.Cell>
                                                <Table.Cell>{eventType.requiredEventType}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </>
                        )}
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
}

export default SourceCataloguePage;
