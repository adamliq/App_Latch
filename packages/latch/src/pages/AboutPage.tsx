import React from 'react';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import DefinitionList from '@splunk/react-ui/DefinitionList';
import Message from '@splunk/react-ui/Message';
import * as splunkConfig from '@splunk/splunk-utils/config';

import { renderDefinitionRows } from '../components/DefinitionRows';
import { APP_DISPLAY_NAME, APP_VERSION, APP_VENDOR, APP_DESCRIPTION } from '../appInfo';

function AboutPage(): React.JSX.Element {
    return (
        <div>
            <Heading level={2}>About {APP_DISPLAY_NAME}</Heading>
            <P>{APP_DESCRIPTION}</P>

            <Heading level={3}>Version</Heading>
            <DefinitionList layout="auto" termWidth="220px">
                {renderDefinitionRows([
                    ['App version', APP_VERSION],
                    ['Vendor', APP_VENDOR],
                    ['Splunk version', splunkConfig.versionLabel || 'Unavailable'],
                    ['Splunk build', String(splunkConfig.buildNumber ?? 'Unavailable')],
                ])}
            </DefinitionList>

            <Heading level={3}>Data source</Heading>
            <P>
                All content in this app — the taxonomy, source catalogue, logging patterns and
                health-check definitions — is bundled with the app as static reference data. No
                external network calls, credentials, or Splunk indexes are required to use it.
            </P>

            <Heading level={3}>Known limitations in this release</Heading>
            <Message type="info">
                <P>
                    This release focuses on the taxonomy browser, source catalogue, logging pattern
                    reference and health-check catalogue. The interactive viability-assessment
                    calculator, logging-pattern advisor wizard, assurance rollup dashboard, CMEI
                    scoring assessments, and prompt library from the original reference tool are not
                    yet ported to this Splunk UI Toolkit app and are planned for a future release.
                    See RELEASE_NOTES.md for details.
                </P>
            </Message>

            <Heading level={3}>Support and feedback</Heading>
            <P>
                See the SUPPORT.md and TROUBLESHOOTING.md files packaged with this app for how to
                get help, and SECURITY.md for how to report a security or accessibility issue.
            </P>
        </div>
    );
}

export default AboutPage;
