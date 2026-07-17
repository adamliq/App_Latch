export interface HealthCheckRow {
    testId: string;
    inputType: string;
    testName: string;
    testCategory: string;
    testDescription: string;
    priority: string;
    passCriteria: string;
    failureAction: string;
    automation: string;
    frequency: string;
    splQuery: string;
    thresholds: string;
    lookbackWindow: string;
    owner: string;
    nodeCode: string;
}
