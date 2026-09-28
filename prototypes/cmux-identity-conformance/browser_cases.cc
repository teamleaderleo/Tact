// Pure production model exercise. The retained canonical graph is supplied by
// this fixture; no claim is made that a live close RPC preserves a browser page.
#include "chrome/browser/cmux_term/window_model.h"
#include <cassert>
#include <iostream>

int main() {
  cmux::WindowModel model;
  auto workspace = model.AddWorkspace(cmux::SurfaceKind::kWeb, "duplicate");
  auto screen = model.GetActiveScreen(workspace)->id;
  cmux::CanonicalScreenTopology canonical;
  cmux::CanonicalPaneSpec pane;
  pane.backend_id = 100;
  for (int i = 0; i < 2; ++i) {
    cmux::CanonicalSurfaceSpec tab;
    tab.backend_id = 1000 + i;
    tab.backend_resource_id = i == 0
        ? "tab_00000000000040008000000000000001"
        : "tab_00000000000040008000000000000002";
    tab.title = "duplicate";
    tab.kind = cmux::SurfaceKind::kWeb;
    pane.tabs.push_back(tab);
  }
  canonical.panes.push_back(pane);
  cmux::CanonicalColumnSpec column;
  column.backend_id = 10;
  column.width = 1;
  column.layout.type = cmux::CanonicalLayoutSpec::Type::kLeaf;
  column.layout.pane = 100;
  canonical.columns.push_back(column);
  canonical.initially_focused_pane = 100;
  assert(model.ReconcileScreenTopology(workspace, screen, canonical));
  auto local_pane = model.AllPanesOf(workspace).front();
  auto old_id = model.FindPane(workspace, local_pane)->tabs.front().id;
  auto durable = model.FindPane(workspace, local_pane)->tabs.front().backend_resource_id;
  model.CloseTab(workspace, local_pane, old_id);
  assert(!model.FindPane(workspace, local_pane)->FindTab(old_id));
  // The canonical owner still reports the tab in this test input. Reopening its
  // projection must allocate a fresh local handle, not resurrect the stale one.
  assert(model.ReconcileScreenTopology(workspace, screen, canonical));
  bool recovered = false;
  for (auto id : model.AllPanesOf(workspace)) {
    for (const auto& tab : model.FindPane(workspace, id)->tabs) {
      assert(tab.id != old_id);
      if (tab.backend_resource_id == durable) {
        assert(tab.backend_id == 1000);
        recovered = true;
      }
    }
  }
  assert(recovered);
  // Duplicate durable IDs are invalid even though duplicate titles were valid.
  canonical.panes.front().tabs.back().backend_resource_id = durable;
  assert(!model.ReconcileScreenTopology(workspace, screen, canonical));
  std::cout << "projection rematerialization and stale local handle checks passed\n";
}
