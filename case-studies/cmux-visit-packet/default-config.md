# What a heavy user overrides, and what the overrides mean

**Status:** measured against `manaflow-ai/cmux` at `e9ec596d1` and the live `~/.config/cmux/cmux.json` that [`terminal-kit`](https://github.com/teamleaderleo/terminal-kit) installs, 2026-09-17.
**Method:** every scalar setting in the live config compared against the `default` declared for it in `web/data/cmux.schema.json`.
**Reproduce:** [`evidence/config-drift.py`](evidence/config-drift.py).

---

## The shape of the drift

60 scalar settings are present in the config. They split three ways:

| | count |
| --- | ---: |
| overridden — differs from the schema default | **29** |
| pinned — written out, identical to the default | **16** |
| no default declared in the schema | **11** |

Three separate findings, one per row.

## 1. The 29 overrides cluster, and the cluster is the point

```text
setting                                      cmux default      this config
sidebar.showWorkspaceDescription                     True            False
sidebar.showBranchDirectory                          True            False
sidebar.showPullRequests                             True            False
sidebar.showPorts                                    True            False
sidebar.showLog                                      True            False
sidebar.showProgress                                 True            False
sidebar.showCustomMetadata                           True            False
sidebar.showNotificationMessage                      True            False
sidebar.watchGitStatus                               True            False
sidebar.notificationMessageLineLimit                   12                1
```

**Nine of nine sidebar detail flags default to on, and this config turns all nine off.** The tenth line caps notification text from 12 lines to 1.

That is not ten independent preferences. It is one preference — *the workspace list is a navigation control, not a dashboard* — expressed ten times because the product models it as ten booleans.

The same shape appears in the renderer settings:

```text
terminal.rendererRealization.maxWarmRenderers            1               12
terminal.rendererRealization.idleSeconds                 5               30
```

By default one renderer stays warm and idle ones are released after five seconds. On a machine with headroom that is a visible cost every time you switch back to a terminal you used a moment ago. The override is "I have RAM, spend it" — again, one intent, expressed as two numbers with no shared handle.

And in appearance:

```text
sidebarAppearance.matchTerminalBackground            False             True
sidebarAppearance.tintOpacity                         0.03             0.88
```

Default is an almost-untinted sidebar that does not follow the terminal background; this config makes the sidebar match the terminal and tints it heavily. One intent — *the window should read as one surface* — two settings.

**The product question:** should these be presets with names (`quiet` / `detailed`, `lean` / `generous`, `unified` / `distinct`) that a user picks and then deviates from, rather than N booleans each user rediscovers? `terminal-kit` already ships exactly that, as [`config/cmux/sidebar-presets.json`](https://github.com/teamleaderleo/terminal-kit/blob/main/config/cmux/sidebar-presets.json) with `quiet` and `details` groups, because ten checkboxes is not a decision a user wants to make ten times.

## 2. The 16 pinned settings are a real gap

These are written into the config file with values *identical to the current default*:

```text
app.focusPaneOnFirstClick                   = True
app.newWorkspacePlacement                   = afterCurrent
app.openMarkdownInCmuxViewer                = True
app.openSupportedFilesInCmux                = True
fileExplorer.doubleClickAction              = preview
shortcuts.showModifierHoldHints             = True
sidebar.hideAllDetails                      = False
sidebar.showAgentActivity                   = True
sidebar.wrapWorkspaceTitles                 = False
terminal.agentHibernation.enabled           = False
terminal.rendererRealization.enabled        = True
terminal.showTextBoxOnNewTerminals          = False
terminal.focusTextBoxOnNewTerminals         = False
...
```

Why would anyone write a setting equal to its default? Because **a config file cannot say "keep this where it is."** Writing the value is the only way to be sure a future release does not move it.

The cost is that the file now cannot distinguish two very different statements:

- *"I chose `false` here and I care"*, and
- *"this happened to be `false` and I wrote it down defensively."*

Nobody can tell them apart — not the user six months later, not a support conversation, and not cmux itself when it wants to know whether a default change is safe to ship.

**The product question:** is there room for an explicit three-state model — *unset (follow the default)*, *pinned (hold today's default)*, *overridden (my value)*? That would let cmux move defaults confidently, and let Settings show a user which of their choices are actually choices. It also turns "we changed a default and broke people's setups" from a guess into a query.

## 3. The 11 undeclared settings are a discoverability gap

`shortcuts.bindings.*` has **no `default` in the JSON schema**, even though every action has a concrete default in Swift (`ShortcutAction+Defaults.swift`). So a user editing `cmux.json` against the published schema cannot see what a binding is currently bound to, or whether their line changes anything.

This is why 7 of the 9 bindings in this config restate the existing default (`cmd+t`, `cmd+w`, `cmd+shift+t`, `cmd+l`, `cmd+f`, `cmd+[`, `cmd+]`). They are finding #2 again, caused by finding #3: you write it down because you cannot see it.

Only **two** bindings are genuine changes:

```text
nextSurface    cmd+shift+]   ->   ctrl+tab
prevSurface    cmd+shift+[   ->   ctrl+shift+tab
```

That single rebind is the most interesting line in the whole file. It moves surface cycling off the overloaded `[`/`]` family and onto the tab-cycling chord every browser and editor already uses — and it is the practical answer to the open question in [`shortcut-namespace.md`](shortcut-namespace.md).

**The cheap fix:** emit the Swift defaults into the published schema. It is a build step, it makes the schema self-documenting, and it would remove most of the reason this config is as long as it is.

## Summary for the room

Three asks, in increasing order of commitment:

1. **Generate `default` values for `shortcuts.bindings.*` into the schema.** Mechanical, no product decision.
2. **Name the clusters.** Sidebar density, renderer generosity, and surface unification are each one decision wearing several booleans. Presets first; the booleans stay for people who want them.
3. **Distinguish pinned from chosen.** This one is a real product decision with real payoff — it is what makes changing a default a safe, measurable operation instead of a risk.

---

## Related

- [`shortcut-namespace.md`](shortcut-namespace.md) — the `[`/`]` overload this config's one real rebind escapes.
- terminal-kit [#28](https://github.com/teamleaderleo/terminal-kit/issues/28) and its `tk customization on|off` profile switch, which exists because there is no other way to A/B a configuration.
- Tact #49 (discoverability), #54 (customizable defaults), #45 (extensibility middle layer).
