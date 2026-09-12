import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const actions = [];
const context = vm.createContext({
  signal: value => [() => value, next => { value = next; }],
  computed: fn => fn, sidebar: () => {},
  data: { workspaces: () => [] }, cmux: (method, params) => actions.push({ method, params })
});
vm.runInContext(fs.readFileSync(new URL('tact-surfaces.js', import.meta.url), 'utf8'), context);
const rows = vm.runInContext(`surfaceRows([
  {id:'w1', title:'Same name', selected:true, tabs:[{id:'panel1', surfaceId:'surface1', title:'shell', focused:true}]},
  {id:'w2', title:'Same name', tabs:[{id:'panel2', surfaceId:'surface2', title:'shell', focused:true}, {surfaceId:'bonsplit-only', title:'missing'}]}
], '')`, context);
assert.equal(rows.length, 3);
assert.notEqual(rows[0].key, rows[1].key);
assert.equal(rows[0].focused, true);
assert.equal(rows[1].focused, false);
context.row = rows[1];
vm.runInContext('focusSurface(row)', context);
assert.equal(actions[0].params.surface_id, 'panel2');
assert.equal(actions[0].params.workspace_id, 'w2');
context.row = rows[2];
vm.runInContext('focusSurface(row)', context);
assert.equal(actions.length, 1, 'missing API id must not fall back to a Bonsplit id or switch workspace');
assert.equal(vm.runInContext(`surfaceRows([{id:'w', title:'Project', tabs:[{id:'p', title:'SHELL'}]}], 'shell').length`, context), 1);
assert.equal(vm.runInContext('lastPage()', context), 0);
assert.equal(vm.runInContext('visible().length', context), 0);
context.data.workspaces = () => [{ id: 'many', title: 'Many', tabs: Array.from({ length: 101 }, (_, i) =>
  ({ id: `panel-${i}`, surfaceId: `surface-${i}`, title: `Surface ${i}` })) }];
assert.equal(vm.runInContext('visible().length', context), 40);
vm.runInContext('setPage(2)', context);
assert.equal(vm.runInContext('visible().length', context), 21);
const keysBefore = vm.runInContext('visible().map(row => row.key).join()', context);
vm.runInContext('setGrouped(true); setCompact(true)', context);
assert.equal(vm.runInContext('visible().map(row => row.key).join()', context), keysBefore);
context.data.workspaces = () => [{ id: 'many', title: 'Many', tabs: [{ id: 'survivor', surfaceId: 'survivor-surface' }] }];
assert.equal(vm.runInContext('currentPage()', context), 0, 'closing surfaces must clamp the page');
assert.equal(vm.runInContext('visible().length', context), 1);
console.log('Surface identity, search, bounded paging, stable toggle identity and lifecycle checks passed.');
