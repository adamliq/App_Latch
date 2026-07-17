export interface LoggingPatternRecord {
    'Pattern ID': string;
    Pattern: string;
    'Source data': string;
    Category: string;
    Direction: string;
    'Source mechanism': string;
    'Collection tier / runtime': string;
    Transport: string;
    Destination: string;
    'Required app / add-on': string;
    'Port / firewall requirements': string;
    'Authentication requirements': string;
    'Source platform requirements': string;
}

export const LOGGING_PATTERN_COLUMNS: Array<keyof LoggingPatternRecord> = [
    'Pattern ID',
    'Pattern',
    'Source data',
    'Category',
    'Direction',
    'Source mechanism',
    'Collection tier / runtime',
    'Transport',
    'Destination',
    'Required app / add-on',
    'Port / firewall requirements',
    'Authentication requirements',
    'Source platform requirements',
];
