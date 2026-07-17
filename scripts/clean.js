#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const targets = [
    path.join(ROOT, 'splunk-app', 'latch', 'appserver', 'static', 'build'),
    path.join(ROOT, 'splunk-app', 'latch', 'appserver', 'templates'),
    path.join(ROOT, 'packages', 'latch', 'coverage'),
    path.join(ROOT, 'release'),
    path.join(ROOT, 'build-report'),
];

for (const target of targets) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`removed ${path.relative(ROOT, target)}`);
}
