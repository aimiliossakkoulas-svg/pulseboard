# Visual QA Checklist — Auth & Landing

Use this checklist before shipping auth or landing changes.

## Keyboard & Focus

- [ ] Tab order follows visual layout: skip link → hero CTAs → main content sections → footer CTAs
- [ ] Skip link appears on first Tab and jumps to `#main-content`
- [ ] All interactive elements (buttons, links, inputs) show visible `:focus-visible` ring (cyan outline)
- [ ] Auth form: email → password → submit → secondary actions in logical order
- [ ] No keyboard traps inside modals or forms
- [ ] Enter submits auth form; Escape does not trap focus

## Tab Order (Auth)

1. Email input (auto-focused on mount / mode change)
2. Password input
3. Password Show/Hide toggle
4. Name / role / company fields (signup only)
5. Submit button
6. "Create new account" or "Log in" link
7. "Back to landing" link

## Tab Order (Landing)

1. Skip link
2. "Join the network" (hero)
3. "Sign in" (hero)
4. Section CTAs and membership buttons
5. Final CTA buttons

## Empty States

- [ ] Auth: empty email/password shows native HTML5 validation messages
- [ ] Auth: server error message appears in `.auth-page-message` with `role="alert"`
- [ ] Landing: preview feed renders when items exist; no broken layout when empty
- [ ] Membership cards render all three tiers without overflow

## Error States

- [ ] Invalid credentials show danger-colored message (WCAG AA contrast)
- [ ] Error message is announced to screen readers (`aria-live="assertive"`)
- [ ] Form fields retain values after failed submit
- [ ] Focus does not jump away from form on error

## Mobile Spacing (640px)

- [ ] Auth panels stack vertically with ≥ 12px gap
- [ ] Headings do not clip or overlap at 320px viewport width
- [ ] Form inputs are ≥ 48px tap height
- [ ] Hero H1 scales down without horizontal scroll
- [ ] Trust block and stats bar wrap cleanly
- [ ] CTA buttons are full-width or comfortably tappable

## Tablet Spacing (1024px)

- [ ] Auth two-column layout collapses to single column
- [ ] Landing hero graphic appears below copy
- [ ] Section headers and meta text do not crowd
- [ ] Company preview grid becomes single column

## Motion & Reduced Motion

- [ ] Hover/focus transitions are subtle (180ms) on cards, nodes, CTAs
- [ ] `prefers-reduced-motion: reduce` disables animations
- [ ] No layout shift on hover transforms

## Contrast (WCAG AA)

- [ ] Body text (`--text-main`) on dark background ≥ 4.5:1
- [ ] Muted text (`--text-muted`) on dark background ≥ 4.5:1
- [ ] CTA button text (`--text-on-accent`) on gradient ≥ 4.5:1
- [ ] Error text (`--danger`) on card background ≥ 4.5:1
- [ ] Focus ring visible against all backgrounds

## Visual Consistency

- [ ] Auth card radius matches landing panels (`--radius-2xl` / `--radius-lg`)
- [ ] Input radius uses `--radius-sm` (12px) everywhere
- [ ] Shadows use `--shadow-card` / `--shadow-panel` tokens
- [ ] Font sizes follow `--text-xs` through `--text-lg` scale
- [ ] Accent gradient consistent on primary buttons

## Trust & Graphics

- [ ] Hero network graph renders with 5 nodes + center
- [ ] Auth side graphic renders 4 nodes with connection lines + pulse
- [ ] Auth activity strip shows sample network updates under the graphic
- [ ] Trust block visible below hero CTAs
- [ ] Decorative graphics marked `aria-hidden="true"`
- [ ] Field labels are visually hidden but available to screen readers
- [ ] Password Show/Hide toggle updates `aria-pressed` and input type

## Cross-Browser Smoke Test

- [ ] Chrome / Edge — layout, focus rings, gradients
- [ ] Firefox — form validation, focus-visible
- [ ] Safari iOS — tap targets, no zoom-on-focus issues (font-size ≥ 16px on inputs if needed)
