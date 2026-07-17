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

import { healthCheckRows } from '../services/healthCheckService';
import type { HealthCheckRow } from '../types/healthCheck';
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

const PAGE_SIZE = 25;

const inputTypes: string[] = [...new Set(healthCheckRows.map((row) => row.inputType).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
);
const priorities: string[] = [...new Set(healthCheckRows.map((row) => row.priority).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
);

function HealthChecksPage(): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [inputType, setInputType] = useState('');
    const [priority, setPriority] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<HealthCheckRow | null>(null);
    const detailTriggerRef = useRef<HTMLElement | null>(null);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return healthCheckRows.filter((row) => {
            const matchesQuery =
                !needle || `${row.testName} ${row.testDescription} ${row.testId}`.toLowerCase().includes(needle);
            const matchesInputType = !inputType || row.inputType === inputType;
            const matchesPriority = !priority || row.priority === priority;
            return matchesQuery && matchesInputType && matchesPriority;
        });
    }, [query, inputType, priority]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div>
            <Heading level={2}>Health Checks</Heading>
            <P>
                Health-check test catalogue used to validate that an onboarded data source is
                collecting, healthy, and within expected thresholds. Derived directly from the
                taxonomy&apos;s health test definitions.
            </P>
            <Toolbar>
                <ControlGroup label="Search" labelPosition="left" hideLabel>
                    <Text
                        placeholder="Search test name or description"
                        value={query}
                        onChange={(_event, data) => {
                            setQuery(data.value);
                            setPage(1);
                        }}
                        canClear
                        aria-label="Search health checks"
                    />
                </ControlGroup>
                <ControlGroup label="Input type" labelPosition="left" hideLabel>
                    <Select
                        value={inputType}
                        onChange={(_event, data) => {
                            setInputType(String(data.value));
                            setPage(1);
                        }}
                        aria-label="Filter by input type"
                    >
                        <Select.Option label="All input types" value="" />
                        {inputTypes.map((name) => (
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
                        {priorities.map((name) => (
                            <Select.Option key={name} label={name} value={name} />
                        ))}
                    </Select>
                </ControlGroup>
            </Toolbar>
            <P>
                Showing {filtered.length.toLocaleString()} of {healthCheckRows.length.toLocaleString()} tests.
            </P>
            {filtered.length === 0 ? (
                <Message type="info">
                    <P>No health checks match the current search and filters.</P>
                </Message>
            ) : (
                <>
                    <Table stripeRows>
                        <Table.Caption side="bottom">
                            <ScreenReaderContent>Health check test catalogue</ScreenReaderContent>
                        </Table.Caption>
                        <Table.Head>
                            <Table.HeadCell>Test ID</Table.HeadCell>
                            <Table.HeadCell>Input type</Table.HeadCell>
                            <Table.HeadCell>Test name</Table.HeadCell>
                            <Table.HeadCell>Category</Table.HeadCell>
                            <Table.HeadCell>Priority</Table.HeadCell>
                            <Table.HeadCell>Details</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {pageRows.map((row) => (
                                <Table.Row key={row.testId}>
                                    <Table.Cell>{row.testId}</Table.Cell>
                                    <Table.Cell>{row.inputType}</Table.Cell>
                                    <Table.Cell>{row.testName}</Table.Cell>
                                    <Table.Cell>{row.testCategory}</Table.Cell>
                                    <Table.Cell>{row.priority}</Table.Cell>
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
                    style={{ width: '680px' }}
                >
                    <Modal.Header
                        title={selected.testName}
                        subtitle={`${selected.testId} — ${selected.inputType}`}
                    />
                    <Modal.Body>
                        <DefinitionList layout="auto" termWidth="200px">
                            {renderDefinitionRows([
                                ['Test category', selected.testCategory],
                                ['Description', selected.testDescription],
                                ['Priority', selected.priority],
                                ['Pass criteria', selected.passCriteria],
                                ['Failure action', selected.failureAction],
                                ['Automation', selected.automation],
                                ['Frequency', selected.frequency],
                                ...(selected.thresholds ? [['Thresholds', selected.thresholds] as [string, string]] : []),
                                ...(selected.lookbackWindow
                                    ? [['Lookback window', selected.lookbackWindow] as [string, string]]
                                    : []),
                                ...(selected.owner ? [['Owner', selected.owner] as [string, string]] : []),
                            ])}
                        </DefinitionList>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
}

export default HealthChecksPage;
