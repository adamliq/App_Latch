import taxonomyNodesJson from '../data/generated/taxonomy-nodes.json';
import type { TaxonomyNode, TaxonomyTreeNode } from '../types/taxonomy';

export const taxonomyNodes = taxonomyNodesJson as TaxonomyNode[];

const nodeIndex = new Map<string, TaxonomyNode>(taxonomyNodes.map((item) => [item.code, item]));

export function getNode(code: string): TaxonomyNode | undefined {
    return nodeIndex.get(code);
}

function rank(node: TaxonomyNode): number {
    if (node.nodeType === 'taxonomy') return 0;
    if (node.nodeType === 'group') return 1;
    return 2;
}

/** Builds the taxonomy tree from the flat node list, sorted the same way as the original tool. */
export function buildTree(items: TaxonomyNode[]): TaxonomyTreeNode[] {
    const byCode = new Map<string, TaxonomyTreeNode>(
        items.map((item) => [item.code, { ...item, children: [] }])
    );
    const roots: TaxonomyTreeNode[] = [];

    byCode.forEach((item) => {
        const parent = item.parentCode ? byCode.get(item.parentCode) : undefined;
        if (parent) {
            parent.children.push(item);
        } else {
            roots.push(item);
        }
    });

    const sortNodes = (list: TaxonomyTreeNode[]): void => {
        list.sort((a, b) => {
            const rankDiff = rank(a) - rank(b);
            if (rankDiff) return rankDiff;
            const aKey = a.displayCode || a.code;
            const bKey = b.displayCode || b.code;
            return aKey.localeCompare(bKey, undefined, { numeric: true });
        });
        list.forEach((node) => sortNodes(node.children));
    };
    sortNodes(roots);
    return roots;
}

export const taxonomyTree = buildTree(taxonomyNodes);

export function getItemDisplayCode(item: TaxonomyNode): string {
    return item.displayCode || (item.nodeType === 'group' ? '' : item.code);
}

/** Resolves the chain of taxonomy ancestors for breadcrumb display, mirroring getTaxonomyPath(). */
export function getTaxonomyPath(item: TaxonomyNode): TaxonomyNode[] {
    const path: TaxonomyNode[] = [];
    const seen = new Set<string>();
    let current: TaxonomyNode | undefined = item;

    while (current && current.code && !seen.has(current.code)) {
        seen.add(current.code);
        if (current.nodeType === 'taxonomy') {
            path.push(current);
            current = current.parentCode ? nodeIndex.get(current.parentCode) : undefined;
        } else {
            const taxonomyParent = current.allowedParent ? nodeIndex.get(current.allowedParent) : undefined;
            current = taxonomyParent ?? (current.parentCode ? nodeIndex.get(current.parentCode) : undefined);
        }
    }
    return path.reverse();
}

function searchableText(item: TaxonomyNode): string {
    return [
        item.displayCode,
        item.code,
        item.domain,
        item.term,
        item.definition,
        item.entityType,
        item.primaryKey,
        item.mandatoryAttributes,
        item.relationshipRule,
        item.sourceWorksheet,
        item.owner,
        item.status,
        JSON.stringify(item.fields || {}),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

/** Returns a pruned copy of the tree containing only nodes (or ancestors of nodes) that match. */
export function filterTree(list: TaxonomyTreeNode[], query: string, domain: string): TaxonomyTreeNode[] {
    return list
        .map((node) => {
            const children = filterTree(node.children, query, domain);
            const domainMatch = !domain || node.domain === domain;
            const queryMatch = !query || searchableText(node).includes(query.toLowerCase());
            const keep = (domainMatch && queryMatch) || children.length > 0;
            return keep ? { ...node, children } : null;
        })
        .filter((node): node is TaxonomyTreeNode => node !== null);
}

export const taxonomyDomains: string[] = [
    ...new Set(taxonomyNodes.map((node) => node.domain).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));
