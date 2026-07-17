export interface SourceCatalogueRecord {
    sourceId: string;
    dataSource: string;
    category: string;
    subCategory: string;
    expectedEvents: string;
    useCases: string;
    priority: string;
    exampleTechnologies: string;
    coverageState: string;
    assuranceState: string;
    mappedComponentIds: string;
    mappedPlatformIds: string;
    mappedOnboardingIds: string;
    averageCim: string;
    averageDetectionCoverage: string;
    note: string;
    requiredEventTypes: string;
    criticalCollectionFocus: string;
    minimumRequiredFields: string;
    acscIsmControlThemes: string;
    validationQuestions: string;
}

export interface SourceEventTypeRecord {
    sourceId: string;
    dataSource: string;
    category: string;
    subCategory: string;
    eventCategory: string;
    importance: string;
    requiredEventType: string;
    controlTheme: string;
    monitoringPurpose: string;
    minimumFields: string;
    collectionNotes: string;
}
