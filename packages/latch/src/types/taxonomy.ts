/** A single row of the LATCH TAX07 taxonomy, as captured in taxonomy-nodes.json. */
export interface TaxonomyNode {
    code: string;
    displayCode: string;
    parentCode: string;
    level: number;
    domain: string;
    term: string;
    definition: string;
    entityType: string;
    idPrefix: string;
    primaryKey: string;
    mandatoryAttributes: string;
    allowedParent: string;
    relationshipRule: string;
    sourceWorksheet: string;
    owner: string;
    status: string;
    notes: string;
    nodeType: 'taxonomy' | 'group' | 'instance';
    entryCount: number;
    fields: Record<string, string | number>;
}

/** A taxonomy node plus its resolved children, used to render the tree control. */
export interface TaxonomyTreeNode extends TaxonomyNode {
    children: TaxonomyTreeNode[];
}
