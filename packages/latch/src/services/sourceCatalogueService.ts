import sourceCatalogueJson from '../data/generated/source-catalogue.json';
import sourceEventTypesJson from '../data/generated/source-event-types.json';
import type { SourceCatalogueRecord, SourceEventTypeRecord } from '../types/sourceCatalogue';

export const sourceCatalogue = sourceCatalogueJson as SourceCatalogueRecord[];
export const sourceEventTypes = sourceEventTypesJson as SourceEventTypeRecord[];

export function getEventTypesForSource(sourceId: string): SourceEventTypeRecord[] {
    return sourceEventTypes.filter((row) => row.sourceId === sourceId);
}

export const sourceCatalogueCategories: string[] = [
    ...new Set(sourceCatalogue.map((row) => row.category).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));

export const sourceCataloguePriorities: string[] = [
    ...new Set(sourceCatalogue.map((row) => row.priority).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));
