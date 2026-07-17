import loggingPatternsJson from '../data/generated/logging-patterns.json';
import type { LoggingPatternRecord } from '../types/loggingPattern';

export const loggingPatterns = loggingPatternsJson as LoggingPatternRecord[];

export const loggingPatternCategories: string[] = [
    ...new Set(loggingPatterns.map((row) => row.Category).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));

export const loggingPatternDestinations: string[] = [
    ...new Set(loggingPatterns.map((row) => row.Destination).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));
