import frameworkConceptsJson from '../data/generated/framework-concepts.json';
import type { FrameworkConcept } from '../types/frameworkConcept';

export const frameworkConcepts = frameworkConceptsJson as FrameworkConcept[];

export const frameworkConceptCategories: string[] = [
    ...new Set(frameworkConcepts.map((row) => row.category).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));

export function conceptId(term: string): string {
    return `concept-${term
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;
}
