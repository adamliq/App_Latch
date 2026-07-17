#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

execFileSync('npm', ['run', 'test:ci', '--workspace', 'packages/latch'], {
    cwd: ROOT,
    stdio: 'inherit',
});
