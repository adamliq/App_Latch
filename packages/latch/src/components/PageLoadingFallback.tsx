import React from 'react';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${variables.spacingMedium};
    padding: calc(${variables.spacing} * 4);
    color: ${variables.contentColorMuted};
`;

function PageLoadingFallback(): React.JSX.Element {
    return (
        <Wrapper>
            <WaitSpinner size="medium" screenReaderText="Loading page" />
            <span aria-hidden="true">Loading…</span>
        </Wrapper>
    );
}

export default PageLoadingFallback;
