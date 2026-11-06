# Repository website visuals

The existing images are used in the editorial homepage. Original names, formats, and
contents are preserved; lightweight first-frame previews live in `optimized/`.

| Existing source | Actual visual | Placement |
|---|---|---|
| `hero-background.png.jpg` | Monochrome collage portrait | Hero |
| `wireframe-head.gif.GIF` | Blue/violet wireframe head | Decision intelligence |
| `terminal-interface.gif.GIF` | Abstract white data tunnel | Data foundations |
| `data-lattice.gif.GIF` | Green terminal-style display | ML built to operate |
| `network-brain.gif.GIF` | Annotated network/brain artwork | Available in the asset library |

Source names are case-sensitive. Some historical names do not describe their contents
accurately; use the actual visual descriptions above.

## Loading and motion

`RepositoryVisual` renders a WebP poster with Next.js Image, intrinsic layout space,
responsive sizes, and a descriptive alt. The hero is prioritized. Service images are
lazy-loaded. Captions and animation controls sit outside the imagery.

The four posters used on the homepage total approximately 168 KB before Next.js image
optimization. Large GIF originals are requested only when a visitor selects Animate.
Pause restores the poster. Nothing animates automatically.

## Rebuild previews

From `web-app/`, with the existing Next.js Sharp dependency available:

```bash
node scripts/prepare-visual-assets.mjs
```

The helper extracts first frames, preserves aspect ratio, caps width without enlarging,
and writes WebP previews. The `Prepare repository visuals` workflow can run the same
preparation remotely and save its outputs as artifacts. No visual content is generated
or substituted by AI.
