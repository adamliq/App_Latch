import { healthCheckRows } from './healthCheckService';

describe('healthCheckService', () => {
    it('derives a non-empty set of health check rows from the taxonomy', () => {
        expect(healthCheckRows.length).toBeGreaterThan(0);
    });

    it('produces rows with unique test IDs', () => {
        const ids = healthCheckRows.map((row) => row.testId);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every row has a test name and an owning node code', () => {
        healthCheckRows.forEach((row) => {
            expect(row.testName).toBeTruthy();
            expect(row.nodeCode).toBeTruthy();
        });
    });

    it('formats thresholds only when threshold fields are present', () => {
        const withThresholds = healthCheckRows.find((row) => row.thresholds);
        expect(withThresholds).toBeDefined();
        expect(withThresholds?.thresholds).toMatch(/Type:|Warning:|Critical:/);
    });
});
