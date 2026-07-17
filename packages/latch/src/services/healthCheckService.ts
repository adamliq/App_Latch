import { taxonomyNodes } from './taxonomyService';
import type { HealthCheckRow } from '../types/healthCheck';

/**
 * Health-check test definitions are authored as taxonomy instance records
 * under TAX-04.07.01 ("Health Check Definitions"), not as a separate data
 * file. This mirrors the derivation the original tool performed in-browser
 * (`healthCheckTableData`) so the two stay in sync automatically whenever the
 * taxonomy is regenerated.
 */
const HEALTH_CHECK_PARENT_CODE = 'CUR::TAX-04.07.01';

function formatThresholds(fields: Record<string, string | number>): string {
    const unit = fields['Definition: Unit'] ? ` ${fields['Definition: Unit']}` : '';
    const parts: string[] = [];
    if (fields['Definition: Threshold Type']) {
        parts.push(`Type: ${fields['Definition: Threshold Type']}`);
    }
    const warning = fields['Definition: Warning Threshold'];
    if (warning !== undefined && warning !== '') {
        parts.push(`Warning: ${warning}${unit}`);
    }
    const critical = fields['Definition: Critical Threshold'];
    if (critical !== undefined && critical !== '') {
        parts.push(`Critical: ${critical}${unit}`);
    }
    return parts.join('; ');
}

export const healthCheckRows: HealthCheckRow[] = taxonomyNodes
    .filter((node) => node.nodeType === 'instance' && node.parentCode === HEALTH_CHECK_PARENT_CODE)
    .map((node) => {
        const fields = node.fields || {};
        return {
            testId: String(fields['Test ID'] ?? node.displayCode ?? ''),
            inputType: String(fields['Input Type'] ?? ''),
            testName: String(fields['Test Name'] ?? node.term ?? ''),
            testCategory: String(fields['Test Category'] ?? ''),
            testDescription: String(fields['Test Description'] ?? node.definition ?? ''),
            priority: String(fields.Priority ?? ''),
            passCriteria: String(fields['Pass Criteria'] ?? ''),
            failureAction: String(fields['Failure Action'] ?? ''),
            automation: String(fields.Automation ?? ''),
            frequency: String(fields.Frequency ?? ''),
            splQuery: String(fields['Definition: SPL Query (truncated)'] ?? ''),
            thresholds: formatThresholds(fields),
            lookbackWindow: String(fields['Definition: Lookback Window'] ?? ''),
            owner: String(fields['Definition: Owner'] ?? node.owner ?? ''),
            nodeCode: node.code,
        };
    });
