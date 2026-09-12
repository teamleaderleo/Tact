// Uses the actual pinned checkout's sidebar prelude, not a reimplemented DSL.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const checkout = process.argv[2];
if (!checkout) throw new Error('Pass the current cmux checkout path');
const nodes = new Map();
const actions = [];
const host = vm.createContext({
  __host_applyOps: raw => {
    for (const op of JSON.parse(raw)) {
      if (op.op === 'create') nodes.set(op.id, { id: op.id, type: op.type });
      if (op.op === 'update') nodes.get(op.id)[op.key] = op.value;
      if (op.op === 'remove') nodes.delete(op.id);
    }
  },
  __host_action: raw => actions.push(JSON.parse(raw)),
  __host_log: text => { throw new Error(text); }
});
vm.runInContext(fs.readFileSync(path.join(checkout,
  'Packages/macOS/CmuxSwiftRenderUI/Sources/CmuxSwiftRenderUI/Resources/SidebarRuntime.js'), 'utf8'), host);
const fixture = [1, 2].map(i => ({ id: `w${i}`, title: `Workspace ${i}`, selected: i === 1,
  tabs: [{ id: `panel${i}`, surfaceId: `surface${i}`, title: `Shell ${i}`, focused: true }] }));
host.__setData('workspaces', JSON.stringify(fixture));
vm.runInContext(fs.readFileSync(new URL('tact-surfaces.js', import.meta.url), 'utf8'), host);
const button = label => [...nodes.values()].find(node => node.type === 'button' && node.text === label);
assert.ok(button('Grouped'));
assert.ok(button('Compact'));
const second = button('Shell 2');
assert.ok(second, 'surface rows must be native buttons');
host.__dispatch(second.id, 'tap', '{}');
assert.deepEqual(actions[0], { kind: 'cmux', method: 'surface.focus', params: { workspace_id: 'w2', surface_id: 'panel2' } });
host.__dispatch(button('Grouped').id, 'tap', '{}');
host.__dispatch(button('Compact').id, 'tap', '{}');
assert.equal(button('Shell 2').id, second.id, 'toggling must preserve the native row node');
host.__setData('workspaces', JSON.stringify(fixture.slice(0, 1)));
assert.equal(button('Shell 2'), undefined);
host.__dispatch(second.id, 'tap', '{}');
assert.equal(actions.length, 1, 'removed row handlers must be disposed');
console.log('Actual upstream sidebar runtime: mount, native buttons, exact focus, stable toggles and disposal passed.');
