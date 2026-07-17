import React from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import CardLayout from '@splunk/react-ui/CardLayout';
import Card from '@splunk/react-ui/Card';
import { username } from '@splunk/splunk-utils/config';

import { taxonomyNodes } from '../services/taxonomyService';
import { sourceCatalogue } from '../services/sourceCatalogueService';
import { loggingPatterns } from '../services/loggingPatternService';
import { healthCheckRows } from '../services/healthCheckService';
import { APP_DESCRIPTION } from '../appInfo';

interface HomeCard {
    to: string;
    title: string;
    description: string;
    stat: string;
}

const cards: HomeCard[] = [
    {
        to: '#/taxonomy',
        title: 'Taxonomy Explorer',
        description: 'Browse the LATCH TAX07 taxonomy tree and inspect any domain, group or instance record.',
        stat: `${taxonomyNodes.length.toLocaleString()} records`,
    },
    {
        to: '#/catalogue',
        title: 'Source Catalogue',
        description: 'Look up expected events, use cases, priority and coverage state for each SIEM data source.',
        stat: `${sourceCatalogue.length} sources`,
    },
    {
        to: '#/patterns',
        title: 'Logging Patterns',
        description: 'Reference the approved collection topologies, transports and prerequisites for onboarding a source.',
        stat: `${loggingPatterns.length} patterns`,
    },
    {
        to: '#/health',
        title: 'Health Checks',
        description: 'Review the health-check test catalogue used to validate onboarded data sources.',
        stat: `${healthCheckRows.length} tests`,
    },
];

function HomePage(): React.JSX.Element {
    return (
        <div>
            <Heading level={2}>SIEM onboarding and assurance reference</Heading>
            <P>{APP_DESCRIPTION}</P>
            {username && <P>Signed in as {username}.</P>}
            <CardLayout gutterSize={16} cardMinWidth={260} wrapCards>
                {cards.map((card) => (
                    <Card key={card.to} to={card.to}>
                        <Card.Header>
                            <Heading level={3}>{card.title}</Heading>
                        </Card.Header>
                        <Card.Body>
                            <P>{card.description}</P>
                            <P>{card.stat}</P>
                        </Card.Body>
                    </Card>
                ))}
            </CardLayout>
        </div>
    );
}

export default HomePage;
