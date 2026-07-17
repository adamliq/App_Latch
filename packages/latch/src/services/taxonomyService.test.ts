import { buildTree, filterTree, getTaxonomyPath, taxonomyNodes, taxonomyTree } from './taxonomyService';
import type { TaxonomyNode } from '../types/taxonomy';

describe('taxonomyService', () => {
    it('loads a non-empty set of taxonomy nodes', () => {
        expect(taxonomyNodes.length).toBeGreaterThan(0);
    });

    it('builds a tree with the seven TAX07 domain roots', () => {
        const rootCodes = taxonomyTree.map((node) => node.code);
        expect(rootCodes).toEqual([
            'TAX-01',
            'TAX-02',
            'TAX-03',
            'TAX-04',
            'TAX-05',
            'TAX-06',
            'TAX-07',
        ]);
    });

    it('nests children under their parentCode', () => {
        const root = taxonomyTree[0];
        expect(root.children.length).toBeGreaterThan(0);
        root.children.forEach((child) => {
            expect(child.parentCode).toBe(root.code);
        });
    });

    it('sorts taxonomy nodes before groups before instances at each level', () => {
        const nodes: TaxonomyNode[] = [
            { ...baseNode(), code: 'B', parentCode: '', nodeType: 'instance' },
            { ...baseNode(), code: 'A', parentCode: '', nodeType: 'taxonomy' },
            { ...baseNode(), code: 'C', parentCode: '', nodeType: 'group' },
        ];
        const tree = buildTree(nodes);
        expect(tree.map((n) => n.code)).toEqual(['A', 'C', 'B']);
    });

    it('filterTree keeps only nodes matching the search query, plus their ancestors', () => {
        const filtered = filterTree(taxonomyTree, 'firewall', '');
        expect(filtered.length).toBeGreaterThan(0);
        // Every leaf-most match should contain the query somewhere in its subtree.
        const flatten = (nodes: typeof filtered): typeof filtered =>
            nodes.flatMap((node) => [node, ...flatten(node.children)]);
        const allNodes = flatten(filtered);
        const hasMatch = allNodes.some((node) =>
            `${node.term} ${node.definition}`.toLowerCase().includes('firewall')
        );
        expect(hasMatch).toBe(true);
    });

    it('filterTree returns nothing for a query with no matches', () => {
        const filtered = filterTree(taxonomyTree, 'zzz-no-such-term-zzz', '');
        expect(filtered).toEqual([]);
    });

    it('getTaxonomyPath returns an ancestor chain ending with the taxonomy domains above the item', () => {
        const domainRoot = taxonomyNodes.find((node) => node.code === 'TAX-04');
        expect(domainRoot).toBeDefined();
        const path = getTaxonomyPath(domainRoot as TaxonomyNode);
        expect(path[path.length - 1].code).toBe('TAX-04');
    });
});

function baseNode(): TaxonomyNode {
    return {
        code: '',
        displayCode: '',
        parentCode: '',
        level: 0,
        domain: '',
        term: 'Term',
        definition: '',
        entityType: '',
        idPrefix: '',
        primaryKey: '',
        mandatoryAttributes: '',
        allowedParent: '',
        relationshipRule: '',
        sourceWorksheet: '',
        owner: '',
        status: '',
        notes: '',
        nodeType: 'taxonomy',
        entryCount: 0,
        fields: {},
    };
}
