# Design Tokens Input for Design OS

Use this content when running `/design-tokens` in Design OS.

---

## Brand Colors

Tracks & Fields uses a distinctive magenta/pink accent color based on their brand identity (visible in their presentation materials).

### Color Palette Recommendation

**Primary Accent:** `fuchsia` (Tailwind)
- Use for: Action buttons, active states, classification badges, progress indicators
- Main shades: `fuchsia-500`, `fuchsia-600` for primary actions
- Lighter: `fuchsia-100`, `fuchsia-200` for backgrounds
- Darker: `fuchsia-700`, `fuchsia-800` for hover states

**Secondary/Neutral:** `stone` (Tailwind)
- Use for: Text, borders, backgrounds, cards
- Main text: `stone-900` (light mode), `stone-100` (dark mode)
- Secondary text: `stone-600` (light), `stone-400` (dark)
- Borders: `stone-200` (light), `stone-700` (dark)
- Card backgrounds: `stone-50` (light), `stone-800` (dark)

**Status Colors:**
- Success/Complete: `emerald-500`
- Warning/Pending: `amber-500`
- Error/Critical: `red-500`
- Info/Optional: `sky-500`

### Classification Badge Colors

| Type | Color | Usage |
|------|-------|-------|
| A | `fuchsia-600` | High value projects |
| B | `fuchsia-500` | Standard full workflow |
| C | `violet-500` | Simplified workflow |
| D | `violet-400` | Simplified workflow |
| E | `stone-500` | Blanket deals |
| Production | `amber-500` | Custom music |

---

## Typography

### Recommended Fonts

**Headings:** DM Sans or Inter
- Clean, modern sans-serif
- Good for dashboard/app interfaces
- Available on Google Fonts

**Body:** DM Sans or Inter
- Same family for consistency
- Highly readable at small sizes

**Monospace:** IBM Plex Mono or JetBrains Mono
- For case numbers, IDs, technical data
- Good for displaying budget amounts

### Type Scale

- **Page title:** 2xl (24px), bold
- **Section title:** xl (20px), semibold
- **Card title:** lg (18px), medium
- **Body text:** base (16px), regular
- **Small text:** sm (14px), regular
- **Caption:** xs (12px), regular

---

## Dark Mode Considerations

The app should support both light and dark modes:

**Light Mode:**
- Background: `white` or `stone-50`
- Cards: `white` with `stone-200` border
- Text: `stone-900`

**Dark Mode:**
- Background: `stone-900` or `stone-950`
- Cards: `stone-800` with `stone-700` border
- Text: `stone-100`

All components should use `dark:` variants for full support.

---

## Expected Design OS Output

After running `/design-tokens`, Design OS should create:
- `product/design-system/colors.json` - Color palette definition
- `product/design-system/typography.json` - Font choices
