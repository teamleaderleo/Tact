# Busy Indicator Thunderdome

Four ways for a sidebar row to show that an agent is working: a spinner in the glyph slot, the status dot breathing, a light band crossing the row, a hairline along the bottom edge. Light and dark, three second loops.

The point of this example is that stills cannot answer the question. A frame of a spinner is a ring of dots and a frame of a shimmer is a gradient; what you are actually deciding is what it is like to have one of these in the corner of your eye for an hour.

The clips are mocks, not recordings. `make-media.mjs` draws the row as plain shapes and pipes frames to ffmpeg, so there is no fake copy or fake project name sitting there to be read instead of watched. Edit a treatment in that file and re-run it:

```bash
node make-media.mjs          # needs ffmpeg; rewrites clips/
node ../../build.mjs .       # re-inline into index.html
```

Nobody has run this dome yet. When someone does, the results go in a `RESULTS.md` next to this file, the way `../cmux-selection/RESULTS.md` records its run.
