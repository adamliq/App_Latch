#!/usr/bin/env node
/*
 * One-time extraction of the embedded reference data from the legacy static
 * HTML tool into standalone JSON files consumed by the SUIT frontend.
 * Not part of the production build; run manually when the source HTML changes.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(
    __dirname,
    '..',
    'SplunkTaxonomy-LATCH-TAX07-ICD-CDC-INP-What-Activity-Target.html'
);
const OUT_DIR = path.join(__dirname, '..', 'packages', 'latch', 'src', 'data', 'generated');

const lines = fs.readFileSync(SRC, 'utf8').split('\n');

function extractArrayLiteral(lineNumber1Based, varName) {
    const line = lines[lineNumber1Based - 1];
    const marker = `const ${varName} = `;
    const pushMarker = `${varName}.push(...`;
    let body;
    if (line.startsWith(marker)) {
        body = line.slice(marker.length).replace(/;\s*$/, '');
    } else if (line.startsWith(pushMarker)) {
        body = line.slice(pushMarker.length).replace(/\)\s*;\s*$/, '');
    } else {
        throw new Error(`Line ${lineNumber1Based} does not start with expected marker for ${varName}: ${line.slice(0, 80)}`);
    }
    return JSON.parse(body);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// Primary taxonomy node array, plus a second push() of supplementary nodes.
const nodesPrimary = extractArrayLiteral(6371, 'nodes');
const nodesExtra = extractArrayLiteral(6393, 'nodes');
const nodes = [...nodesPrimary, ...nodesExtra];
fs.writeFileSync(path.join(OUT_DIR, 'taxonomy-nodes.json'), JSON.stringify(nodes));
console.log(`taxonomy-nodes.json: ${nodes.length} nodes`);

const loggingPatternTableData = extractArrayLiteral(7772, 'loggingPatternTableData');
fs.writeFileSync(
    path.join(OUT_DIR, 'logging-patterns.json'),
    JSON.stringify(loggingPatternTableData)
);
console.log(`logging-patterns.json: ${loggingPatternTableData.length} rows`);

const siemSourceCatalogueData = extractArrayLiteral(7813, 'siemSourceCatalogueData');
fs.writeFileSync(
    path.join(OUT_DIR, 'source-catalogue.json'),
    JSON.stringify(siemSourceCatalogueData)
);
console.log(`source-catalogue.json: ${siemSourceCatalogueData.length} rows`);

const sourceEventTypeMatrixData = extractArrayLiteral(7814, 'sourceEventTypeMatrixData');
fs.writeFileSync(
    path.join(OUT_DIR, 'source-event-types.json'),
    JSON.stringify(sourceEventTypeMatrixData)
);
console.log(`source-event-types.json: ${sourceEventTypeMatrixData.length} rows`);

// frameworkConcepts spans multiple lines (10591-10635); extract by slicing the
// source between the const declaration and the closing `];` line.
function extractMultilineArray(startLine1Based, varName) {
    const startIdx = startLine1Based - 1;
    if (!lines[startIdx].startsWith(`const ${varName} = [`)) {
        throw new Error(`Unexpected start line for ${varName}: ${lines[startIdx]}`);
    }
    let endIdx = startIdx;
    for (let i = startIdx; i < lines.length; i += 1) {
        if (lines[i].trim() === '];') {
            endIdx = i;
            break;
        }
    }
    const chunk = [lines[startIdx].slice(`const ${varName} = `.length), ...lines.slice(startIdx + 1, endIdx + 1)].join('\n');
    // Source uses unquoted object keys (JS literal, not strict JSON); this file
    // is part of our own repository, not external input, so Function() is safe here.
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${chunk.replace(/;\s*$/, '')});`)();
}

const frameworkConcepts = extractMultilineArray(10591, 'frameworkConcepts');
fs.writeFileSync(
    path.join(OUT_DIR, 'framework-concepts.json'),
    JSON.stringify(frameworkConcepts)
);
console.log(`framework-concepts.json: ${frameworkConcepts.length} rows`);

console.log('Done.');
