# Spatial memory, overview, and edge bookmarks

This note extends [`power-from-seeing-the-field.md`](power-from-seeing-the-field.md) into a narrower question: **how should a working field behave when many tasks need to coexist and one task needs deep focus?**

Leo's habit of leaving window edges visible on a large monitor is a real interaction technique. A sliver of a window can carry identity, location, and unfinished intent. The screen becomes closer to a desk where papers keep their places than a stack where every inactive object disappears.

The strongest synthesis from the examples below is:

> **Preserve geography; adapt salience.**

Let user-learned positions accumulate value. Change emphasis, detail, filtering, and status as circumstances change. Move objects when the user moves them, when a new object arrives at a predictable frontier, or when the meaning of the view is explicitly an ordering such as search results or a live feed.

A second claim follows:

> **A good overview is the same world at a lower semantic resolution.**

Overview should preserve enough adjacency and location that returning to focus feels like approaching a known place.

## 1. Spatial memory owns the warm working set; search owns the cold archive

Spatial memory pays when the user revisits a bounded set repeatedly.

Scarr, Cockburn, and Gutwin's review describes a central property of spatial memory in interfaces: users can learn item locations and retrieve controls with little visual search, while rearranging items spends that learned knowledge. Microsoft's Data Mountain made the same idea concrete for documents. Users manually placed page thumbnails on a fixed-view field with passive landmarks, could see the whole field, and retrieved pages more quickly than with Internet Explorer 4 Favorites in the study.

Data Mountain also made two decisions that deserve attention today:

- the viewpoint stayed fixed, so spatial retrieval never turned into camera navigation;
- the user placed the documents, so location encoded personal meaning instead of an algorithm's temporary ranking.

That suggests a practical boundary.

Spatial retrieval is strongest for:

- a repeated working set;
- tasks whose identity is partly visual or contextual: "the API investigation beside the terminal";
- comparison and monitoring, where nearby state remains useful;
- incomplete work whose visible presence acts as prospective memory;
- objects that persist long enough for location learning to compound.

Search is strongest for:

- a huge archive;
- a target with a memorable name or phrase;
- one-off retrieval;
- objects whose lifetime is short;
- recovery across devices or after long gaps;
- queries that cut across many prior contexts.

The useful hybrid is simple:

```text
search / chronology -> promote into the warm field -> stable position during active use -> retire to searchable history
```

Search finds an old thing. Space keeps an active thing findable before the user has to formulate a query.

### Browser version of the boundary

Arc accidentally gives this distinction a crisp product form. Pinned Tabs belong to a particular Space and remain there; unpinned tabs are transient and archive after an idle interval. The attractive idea is the lifecycle split: **persistent geography for promoted work, automatic cleanup for explicitly transient work.**

The danger is misclassification. Arc's unpinned tabs auto-archive by default after 12 hours and the current help documentation says auto-archive cannot be disabled. A tab the user was treating as a spatial reminder can disappear because the product classified it as transient. Spatial systems need an inexpensive promotion gesture and a visible lifecycle boundary.

Edge's vertical tabs make the simpler case. A side rail gives titles more room and lets a long working set occupy a stable scan direction. Another layer of grouping should earn its cognitive cost; position and recognizable titles can already carry a surprising amount.

## 2. Existing landmarks should stay; new arrivals need a predictable frontier

The cleanest modern example is niri's scrollable tiling model. Its design principles explicitly say that opening a new window should leave existing window sizes alone and that the focused window should stay visually still while windows elsewhere open, close, or resize. New windows can join the strip while established work remains intact.

Traditional tiling makes the opposite trade. In i3, opening a second window splits available space, and deeper splits continue dividing containers. The model is deterministic and powerful, yet a new terminal can resize a browser, reflow text, and move boundaries the user had already learned. The user gains packing efficiency while paying with spatial disturbance.

macOS exposes the same conflict in a setting: Mission Control can automatically rearrange Spaces by most recent use. Recency may shorten the next switch during bursty work. It also changes the mapping between "the desktop to my left" and the work that lives there. Stage Manager similarly uses a recent-app rail on the left while letting the center windows be manually arranged.

A better division of labor is:

- **user-placed task/window:** keep its location;
- **current urgency:** change emphasis, badge, contrast, or edge status;
- **new arrival:** insert at a stable frontier or inbox lane;
- **live ordered stream:** reorder because ordering is the meaning of the view;
- **explicit user sort:** move, because the user asked for a new ordering;
- **prediction:** cue the predicted target while preserving its coordinates.

Findlater et al.'s "ephemeral adaptation" is unusually relevant here. Predicted menu items appeared immediately while other items faded in gradually. The experiment improved selection performance while preserving spatial consistency. The machine moved attention instead of moving the targets.

## 3. Overview should transform scale while preserving topology

Overview mode often fails by becoming a separate dashboard. The user enters a new layout, learns a second set of positions, chooses an item, then returns to a world whose relationship to the overview was only approximate.

The strongest examples preserve the map.

### niri

niri's overview zooms out the same workspaces and windows. The user can keep using familiar keyboard actions and can drag windows across workspaces directly in the overview. Its interaction also becomes available during the zoom animation instead of waiting for the animation to finish. The overview acts like pulling the camera back from the existing field.

### GNOME Activities

GNOME's Activities overview shows live thumbnails of the windows on the current workspace and allows immediate search by typing. Adjacent workspaces appear partially at the left and right edges. That small exposure is especially good: it teaches the horizontal workspace relationship while also functioning as a literal edge bookmark.

### Supreme Commander

Supreme Commander remains one of the clearest examples of semantic zoom in a complex interface. The camera can move continuously from individual units to a continental view; at large scale, units become colored icons. The product changes representation as detail loses usefulness.

The sequel supplies a sharp counterexample across modalities. GameSpot praised the smooth zoomed-out battlefield view while criticizing audio that failed to scale with the visual overview, producing abrasive overload during battles. **Semantic zoom has to reduce every attention channel that scales with the field, including sound.**

### VS Code

VS Code offers a more local version of the same move. Multiple editor groups can stay arranged, while the active group can temporarily expand or maximize; floating windows restore their locations across restarts. Locked editor groups let a terminal or other reference region keep its place while new files open elsewhere. Focus is a reversible change in allocation, not a destruction of the prior arrangement.

### An overview checklist

A good overview should preserve these invariants:

1. **Topology:** left stays left, neighboring tasks remain neighbors, workspace order survives.
2. **Identity:** each task has a recognizable visual token at every scale.
3. **Focus trace:** the current task remains visibly selected during zoom-out.
4. **Semantic detail:** fine content becomes a terse task/state representation as scale decreases.
5. **Interaction continuity:** familiar navigation and selection continue to work in overview.
6. **Exact return:** leaving overview restores the same task, location, scroll position, and local arrangement.
7. **Interruptible motion:** animation explains where the view went while input takes effect immediately.

A thumbnail wall that simply makes every full interface tiny satisfies scale and fails semantic detail. Text becomes dust. Chrome, editor chrome, toolbars, and incidental content compete at the exact moment the user needs identity and status.

## 4. Edge bookmarks deserve a dedicated experiment

Microsoft Research's Scalable Fabric is the closest historical match to Leo's exposed-window-edge habit.

It divided a large display into a central focus region and a peripheral region. Dragging a window toward the edge scaled it down. "Minimize" returned a window to its remembered peripheral location; restoring brought it back to its remembered focus location. Peripheral windows could form named task clusters, and clicking a task swapped its windows into the center.

The compelling interaction is the redefinition of minimize:

```text
minimize = return this task to its remembered peripheral place
restore = bring this task back to its remembered working place
```

That is much richer than turning a window into a taskbar icon. The periphery preserves identity, grouping, and geography.

The evidence also supplies useful restraint. A comparison against the Windows XP taskbar found Scalable Fabric easy to learn and valuable to participants, while task performance time showed no significant difference. Later users encountered performance and behavior problems in the prototype. The idea therefore deserves a modern test with modern rendering and careful repeated-use measures.

### What an edge bookmark should carry

A peripheral window needs enough information for recognition and prospective memory:

- stable screen position;
- app/task identity;
- a short human label when identity is ambiguous;
- one meaningful state signal such as blocked, changed, recording, finished, or unread;
- enough visual content to trigger recognition when the content itself is memorable;
- a large, predictable pointer target even when the visible strip is narrow.

The edge should stay visually quiet. A dozen live miniature interfaces updating at full visual intensity would turn peripheral memory into peripheral interruption. Update content selectively; keep position and silhouette constant.

A useful variant is a **cropped edge**, closer to Leo's current behavior, instead of a scaled mini-window. Cropping preserves the original rendering scale and lets a title bar, document color, terminal background, or distinctive page edge act as the cue. Scaling shows more content; cropping preserves stronger perceptual identity. Test both.

## 5. Many concurrent tasks should form levels of presence

Thirty tasks cannot all occupy foreground status at once. A spatial environment can keep them available while giving them different representational resolutions.

A useful four-level model:

```text
focus:       1–2 tasks, full interaction and full detail
warm edge:   ~4–8 tasks, persistent spatial bookmarks + terse live state
overview:    ~10–30 tasks, semantic cards/tokens in stable positions
archive:     unbounded history, recovered through search/chronology
```

These numbers are hypotheses for testing, not limits.

Several existing products contain pieces of this model:

- Windows Snap Groups preserve a multi-window arrangement as one switchable unit.
- Blender Workspaces save task-specific editor layouts in the project and can remember a scene for a workspace.
- Photoshop can save workspaces, collapse panels, and lock the workspace against accidental panel movement.
- VS Code can persist view locations, lock groups, shrink pinned tabs, and maximize one region temporarily.
- EVE Online's Overview supports up to 20 configurable tabs with filters and exception priorities. The density becomes usable because each tab defines a bounded question such as which entities deserve display and which relationships deserve danger emphasis.

The recurring lesson is that **task identity should outrank application identity**. Scalable Fabric explicitly called out the weakness of grouping windows by application: two Word documents may belong to unrelated activities, while a browser, terminal, editor, and chat can form one real task. A spatial task field should cluster the things that resume together.

## 6. "Zoomed out but still calm" requires semantic compression

Calm at large scale comes from reducing representational detail while preserving identity and relationships.

Five concrete requirements emerge:

### Keep geometry stable

The overview should feel learned after repeated use. Dynamic ranking can appear as a separate list, search result, or attention queue while the spatial field keeps its coordinates.

### Replace detail with meaning

At distance, show task name, dominant artifact, state, and exceptional status. Drop tiny toolbars, paragraphs, editor gutters, and decorative chrome. Supreme Commander turning units into icons is the model.

### Preserve readable type

Semantic zoom should remove text before shrinking it below comfortable reading size. A calm overview has fewer words at normal readable sizes, not every word rendered microscopically.

### Bound animation

Motion should show where an object came from and where it went. Continuous pulsing, live-thumbnail churn, and many simultaneous status animations consume the exact peripheral attention the overview is meant to protect.

### Reserve salience for exceptions

EVE's filters illustrate the expert version: users decide which categories belong in a view and which relationships deserve stronger row treatment. A multi-task overview should use strong salience for changed, blocked, urgent, or selected state. Healthy tasks can remain visually quiet.

## 7. Counterexamples worth keeping around

These are useful because each exposes a boundary in the thesis.

| Example | Valuable idea | Failure mode to test |
| --- | --- | --- |
| macOS auto-rearranged Spaces | recency can shorten bursty switching | MRU ordering spends learned desktop position |
| Stage Manager recent-app rail | current task gets generous center space | recency rail turns location into a moving target as the set changes |
| i3 split tiling | deterministic packing and keyboard navigation | each arrival can resize existing work and trigger content reflow |
| Arc unpinned tabs | transient work cleans itself up | automatic retirement can erase a spatial reminder before the user promotes it |
| Figma infinite canvas | direct spatial arrangement and zoom | unlabeled geography can become archaeology; sections and links become necessary landmarks |
| EVE Overview | enormous expert-visible state | configuration tax rises as filters, exceptions, colors, and tabs accumulate |
| tiny-thumbnail overview | everything remains technically visible | identity and status disappear into miniature chrome |
| Supreme Commander audio at strategic zoom | the whole battlefield stays visually legible | audio density can remain at tactical scale and exhaust attention |

The central warning: **spatial persistence can preserve junk as efficiently as it preserves useful work.** Retirement still needs a mechanism. The environment should make promotion, demotion, and cleanup predictable while keeping active geography stable.

## 8. Experiments worth building

### A. Edge bookmarks vs MRU switching

Prototype a 27-inch desktop with 12 concurrent tasks. Six tasks can sit as user-placed peripheral strips around a central focus region.

Compare:

1. stable cropped edge bookmarks;
2. stable scaled mini-windows;
3. an MRU task rail;
4. a searchable task switcher.

Use repeated switching tasks with three target types:

- repeated warm tasks;
- recently used tasks;
- cold tasks identified by name.

Measure target acquisition time, wrong switches, pointer/keyboard actions, and resumption time after focus changes. Repeat after a delay so learned location gets a chance to pay off.

Prediction: stable edge positions should dominate repeated warm switching, MRU should help short bursts, and search should dominate cold named retrieval.

### B. Topology-preserving overview vs reflow

Create 20 task objects with realistic mixed state: healthy, blocked, changed, completed, and waiting for judgment.

Compare:

1. an overview that preserves task positions and changes each task into a semantic card;
2. a recency-ranked grid that reflows on each change;
3. a fixed list plus search.

Ask users to find a blocked task, compare three related tasks, enter one task deeply, return to overview, and later recover a task from memory.

Measure switch time, wrong selection, time spent scanning, location recall, and return-to-previous-context errors.

### C. Cropping vs scaling at the edge

Take six recognizable windows and expose them in peripheral strips of several widths. Compare cropped full-scale fragments with scaled full-window thumbnails.

Vary which cue survives: title, favicon/app icon, dominant content, custom task label, and status marker.

Find the minimum visible representation that still supports reliable recognition. This gets directly at Leo's observation that a title bar or visible strip can act as a bookmark.

## Working synthesis

The spatial interface worth pursuing is neither a fullscreen stack nor a miniature cockpit.

It is a field with memory:

```text
stable task geography
+ one generous focus region
+ persistent low-bandwidth peripheral bookmarks
+ semantic zoom for overview
+ dynamic salience without dynamic relocation
+ explicit promotion / retirement
+ search for the cold archive
```

The user should be able to pull back and see where the work lives, dive into one task until the rest nearly disappears, then return to the same constellation.

## Sources worth returning to

- Scarr, Cockburn, Gutwin — *Supporting and Exploiting Spatial Memory in User Interfaces* (2013): https://doi.org/10.1561/1100000046
- Robertson et al. — *Data Mountain: Using Spatial Memory for Document Management* (UIST 1998): https://www.microsoft.com/en-us/research/wp-content/uploads/1998/01/p153-robertson.pdf
- Robertson et al. — *Scalable Fabric: Flexible Task Management* (AVI 2004): https://erichorvitz.com/Scalable_Fabric.htm
- Findlater et al. — *Ephemeral adaptation* (CHI 2009): https://www.cs.ubc.ca/labs/imager/tr/2009/findlater_chi_ephemeral/
- niri design principles: https://github.com/YaLTeR/niri/wiki/Development:-Design-Principles
- niri overview: https://github.com/niri-wm/niri/blob/main/docs/wiki/Overview.md
- GNOME Activities overview: https://help.gnome.org/gnome-help/shell-introduction.html
- GNOME workspace switching: https://help.gnome.org/gnome-help/shell-workspaces-switch.html
- i3 User's Guide: https://i3wm.org/docs/userguide.html
- Apple Mission Control settings: https://support.apple.com/guide/mac-help/change-desktop-dock-settings-mchlp1119/mac
- Apple Stage Manager: https://support.apple.com/guide/mac-help/use-stage-manager-mchl534ba392/mac
- Windows Snap Groups: https://support.microsoft.com/en-us/windows/experience/snap-your-windows
- Arc Pinned Tabs: https://resources.arc.net/hc/en-us/articles/19231060187159-Pinned-Tabs-Tabs-you-want-to-stick-around
- Arc Auto Archive: https://resources.arc.net/hc/en-us/articles/19228855311127-Auto-Archive-Clean-as-you-go
- VS Code custom layout: https://code.visualstudio.com/docs/configure/custom-layout
- Photoshop panel/workspace organization: https://helpx.adobe.com/photoshop/desktop/get-started/learn-the-basics/move-panels.html
- Blender Workspaces: https://docs.blender.org/manual/en/latest/interface/window_system/workspaces.html
- Figma sections: https://help.figma.com/hc/en-us/articles/9771500257687-Organize-your-canvas-with-sections
- Figma zoom/view options: https://help.figma.com/hc/en-us/articles/360041065034-Adjust-your-zoom-and-view-options
- EVE Online Overview settings: https://support.eveonline.com/hc/en-us/articles/203273831-Overview-Settings
- GameSpot — *Supreme Commander* strategic zoom preview: https://www.gamespot.com/articles/e3-06-supreme-commander-updated-impressions/1100-6150433/
- GameSpot — *Supreme Commander 2* review and audio-scaling critique: https://www.gamespot.com/reviews/supreme-commander-2-review/1900-6254130/

— Miso 🐈