# Pane Focus Flash Thunderdome

cmux draws a ring around a pane when focus or attention lands there: a focus-history jump, Cmd-Shift-H, a restored panel, a notification. On main the ring blinks twice over 0.9 s. [manaflow-ai/cmux#14894](https://github.com/manaflow-ai/cmux/pull/14894) proposes one pulse that peaks at 0.12 s and is gone by 0.4 s. This dome puts that next to two alternatives:

| Contender | Pattern |
| --- | --- |
| Double blink | `values [0, 1, 0, 1, 0]`, `keyTimes [0, .25, .5, .75, 1]`, 0.9 s (main) |
| Short pulse | `values [0, 1, 0]`, `keyTimes [0, .3, 1]`, 0.4 s (#14894) |
| Slow pulse | the same shape over 0.6 s |
| No flash | none; the unfocused-pane dim and the tab accent carry focus alone |

Each clip is a 3 s loop of the same two-pane split in cmux's default light or dark terminal palette: focus moves right at 0.5 s and back left at 2.0 s.

## How the clips are made

`focus-flash-clip.swift` is a harness for cmux's ui-lab (`scripts/ui-lab/ui-lab.py` in the cmux repo). It is a faithful mock, not a recording: it draws the split with the app's metrics and colors (cited at the top of the file) and applies the flash opacity with the same keyframes and ease-in/ease-out timing functions as the terminal's `CAKeyframeAnimation`. Frames are rendered at 2x and 60 fps, then encoded:

```bash
# from a cmux checkout
scripts/ui-lab/ui-lab.py <path>/focus-flash-clip.swift --out /tmp/ffc
for v in old-double-blink new-pulse slow-pulse no-flash; do for s in light dark; do
  ffmpeg -framerate 60 -i "/tmp/ffc/$v-f%04d-$s@2x.png" -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -pix_fmt yuv420p -an clips/$v-$s.webm
done; done
node ../../build.mjs .
```

Nobody has run this dome yet. Results go in a `RESULTS.md` next to this file.
