# Website design system

The public homepage uses an editorial layout with an ink, ivory, and chartreuse
palette. The design follows the existing web-app PRD and keeps the site on Next.js
and Vercel.

## Visual language

- Ink: `#0d1410`; ivory: `#f3f4e9`; accent: `#d6fa60`.
- Light section paper: `#eff0e5`; body copy on paper: `#53604f`.
- Arial/Helvetica for navigation and body; Georgia italic for display emphasis.
  System fonts avoid a font-download dependency.
- Oversized type, generous section spacing, thin dividers, restrained corner radii.
- The repository's monochrome collage portrait anchors the hero. The wireframe head,
  abstract data tunnel, and terminal visual support the three capabilities.
- Compact WebP posters load by default. Original GIFs load only after a visitor selects
  Animate; Pause returns to the static poster. No motion plays automatically, including
  for visitors who prefer reduced motion.
- Abstract images are illustrative, not client screenshots or live monitoring. Captions
  remain outside the images so text stays readable. Original files are preserved.
- Portfolio demonstrations are identified as such. Metrics, logos, and client claims
  must be backed by evidence before being added.

## Responsive and accessible behavior

The desktop header becomes a disclosure navigation at 900px. Mobile navigation
supports Escape and returns focus to its trigger. The contact form keeps the API
contract, uses shared field limits, and announces delivery feedback. The nonmodal
support dialog focuses its labeled input on opening and returns focus on closing.

Visible focus styles, a skip link, semantic landmarks, reduced-motion support,
and responsive input sizes are part of the design. Homepage rules use the
`edi-` prefix; shared Tailwind colors align the workbench with the same palette.

## Validation

`Website design QA` builds the production app, checks layouts at 320, 390, 768,
and 1440 pixels, runs axe WCAG 2 A/AA checks on the homepage and open chat, tests
keyboard navigation and a mocked contact flow, tests image loading and opt-in animation/pause, and smoke-tests the CSV workbench.
No email or live agent call is made by those browser checks. Screenshots are saved
as `website-design-screenshots` workflow artifacts.
