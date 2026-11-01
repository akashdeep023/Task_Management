#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const scope = JSON.parse(fs.readFileSync('coverage-critical.json', 'utf8'));
const files = [...new Set(Object.values(scope.modules).flat())].sort();
const percent = (covered, total) => total ? covered * 100 / total : 0;
const round = n => Number(n.toFixed(2));
const baselineHashes = JSON.parse(fs.readFileSync('reports/baseline-source-hashes.json', 'utf8'));
if (baselineHashes.baselineCommit !== scope.baselineCommit) throw new Error('Baseline hash commit mismatch.');
const hash = file => baselineHashes.files[file];
function readReport(directory) {
  const raw = JSON.parse(fs.readFileSync(path.join(directory, 'coverage-summary.json'), 'utf8'));
  const entries = Object.entries(raw).filter(([key]) => key !== 'total');
  const result = {};
  for (const file of files) {
    const matches = entries.filter(([key]) => key.replaceAll('\\', '/').endsWith('/' + file));
    if (matches.length !== 1) throw new Error('Missing or ambiguous coverage entry: ' + file);
    const lines = matches[0][1].lines;
    if (!Number.isFinite(lines.total) || !Number.isFinite(lines.covered) || !lines.total) throw new Error('Invalid line denominator: ' + file);
    result[file] = { total: lines.total, covered: lines.covered, pct: percent(lines.covered, lines.total) };
  }
  return result;
}
function aggregate(data, names) {
  const total = names.reduce((sum, f) => sum + data[f].total, 0);
  const covered = names.reduce((sum, f) => sum + data[f].covered, 0);
  return { total, covered, pct: percent(covered, total) };
}
fs.mkdirSync('reports', { recursive: true });
if (process.argv.includes('--record-baseline')) {
  const measured = readReport('coverage/baseline');
  if (Object.values(measured).some(x => x.covered !== 0)) throw new Error('Zero-test baseline unexpectedly executed source code.');
  const baseline = {
    schemaVersion: 1, baselineCommit: scope.baselineCommit,
    originalTests: scope.baselineOriginalTests, metric: 'lines',
    method: 'Retrospective instrumentation of source archived from the pinned Git commit; probe is not an application test.',
    recordedAt: new Date().toISOString(),
    files: Object.fromEntries(files.map(f => [f, { ...measured[f], sha256: hash(f) }])),
  };
  fs.writeFileSync('coverage-baseline.json', JSON.stringify(baseline, null, 2) + '\n');
  console.log('Baseline recorded: 0 original tests; 0 covered lines in critical files.');
  process.exit(0);
}
const baseline = JSON.parse(fs.readFileSync('coverage-baseline.json', 'utf8'));
if (baseline.baselineCommit !== scope.baselineCommit || baseline.metric !== 'lines' ||
    JSON.stringify(Object.keys(baseline.files).sort()) !== JSON.stringify(files)) throw new Error('Baseline and scope do not match.');
if (process.argv.includes('--verify-baseline')) {
  const measured = readReport('coverage/baseline');
  for (const file of files) {
    const old = baseline.files[file];
    if (hash(file) !== old.sha256 || measured[file].total !== old.total || measured[file].covered !== old.covered) {
      throw new Error('Baseline source or measurement changed: ' + file + '. Reconstruct from the pinned baseline commit before updating it.');
    }
  }
  console.log('Stored baseline reproduced, source hashes and line denominators match.');
  process.exit(0);
}
const current = readReport('coverage/unit');
const result = JSON.parse(fs.readFileSync('reports/unit-tests.json', 'utf8'));
if (result.numTotalTests < scope.minimumTests || result.numPassedTests !== result.numTotalTests ||
    result.numFailedTests > 0 || result.numPendingTests > 0 || result.numTodoTests > 0) throw new Error('Unit test count/pass gate failed.');
const rows = Object.entries(scope.modules).map(([name, members]) => {
  const old = aggregate(baseline.files, members), now = aggregate(current, members);
  return { module: name, baseline: round(old.pct), current: round(now.pct), delta: round(now.pct - old.pct), covered: now.covered, total: now.total, passed: now.pct - old.pct + 1e-9 >= scope.minimumDeltaPoints };
});
const fileRows = files.map(file => {
  const old = baseline.files[file], now = current[file];
  return { file, baseline: round(old.pct), current: round(now.pct), delta: round(now.pct - old.pct), covered: now.covered, total: now.total, passed: now.pct - old.pct + 1e-9 >= scope.minimumDeltaPoints };
});
const unique = aggregate(current, files), original = aggregate(baseline.files, files);
const evidence = {
  metric: 'lines', baselineCommit: baseline.baselineCommit, minimumDeltaPoints: scope.minimumDeltaPoints,
  tests: { total: result.numTotalTests, passed: result.numPassedTests, failed: result.numFailedTests, skipped: result.numPendingTests || 0 },
  modules: rows, files: fileRows,
  criticalAggregate: { baseline: round(original.pct), current: round(unique.pct), delta: round(unique.pct - original.pct), covered: unique.covered, total: unique.total },
  passed: rows.every(x => x.passed) && fileRows.every(x => x.passed),
};
fs.writeFileSync('reports/critical-coverage.json', JSON.stringify(evidence, null, 2) + '\n');
const markdown = [
  '# E10 - Critical-module coverage',
  '',
  'Metric: executable lines. Original suite: 0 tests. Baseline probe excluded from unit-test count.',
  'Unit tests: ' + result.numPassedTests + '/' + result.numTotalTests + ' passed.',
  '',
  '| E2 module | Baseline | Current | Increase (percentage points) | Result |',
  '| --- | ---: | ---: | ---: | --- |',
  ...rows.map(r => '| ' + r.module + ' | ' + r.baseline.toFixed(2) + '% | ' + r.current.toFixed(2) + '% | +' + r.delta.toFixed(2) + ' | ' + (r.passed ? 'PASS' : 'FAIL') + ' |'),
  '',
  'Shared files participate in multiple E2 modules. The aggregate deduplicates files and weights by executable lines.',
  'Critical aggregate: ' + unique.covered + '/' + unique.total + ' lines (' + round(unique.pct).toFixed(2) + '%).',
  'Every critical file is also checked separately for a minimum increase of 20 percentage points.',
  '',
].join('\n');
fs.writeFileSync('reports/critical-coverage.md', markdown);
console.log(markdown);
if (!evidence.passed) throw new Error('Critical coverage improvement gate failed: at least one module/file is below +20 percentage points.');

