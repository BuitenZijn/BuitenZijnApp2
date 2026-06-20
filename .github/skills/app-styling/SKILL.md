---
name: app-styling
description: "BuitenZijn design system and styling guide. Use when: creating new pages, components, or UI elements; styling buttons, cards, inputs, forms; applying colors, gradients, typography, spacing; ensuring consistent look-and-feel across web (Tailwind CSS) and mobile (React Native StyleSheet). Covers: color palette, font families, component variants, animation patterns, layout conventions, dark mode, responsive design."
---

# BuitenZijn App Styling Guide

## When to Use

- Creating or updating any UI component (web or mobile)
- Choosing colors, fonts, spacing, or shadows
- Building new pages or sections
- Ensuring visual consistency across web and mobile

---

## Color Palette

All colors are shared between web and mobile. On the web they are available as Tailwind classes (`bg-green-500`, `text-blue-600`, etc.) and as CSS custom properties (`var(--green-500)`). On mobile they are imported from `mobile/src/styles/theme.ts`.

### Primary Colors

| Name      | 50      | 100     | 200     | 300     | 400     | 500         | 600     | 700     | 800     | 900     |
| --------- | ------- | ------- | ------- | ------- | ------- | ----------- | ------- | ------- | ------- | ------- |
| **Green** | #edf7ed | #d1ebd0 | #a3d7a1 | #75c372 | #5ebc5a | **#4EB54A** | #3f9a3c | #2f7a2e | #1f5c1f | #1f5c1f |
| **Blue**  | #e8f1f9 | #c5dcf0 | #8bb9e1 | #5196d2 | #2e81c7 | **#186DB7** | #135a97 | #0e4677 | #083459 | #083459 |

### Complementary Colors

| Name           | 500     |
| -------------- | ------- |
| **Orange**     | #E07A1F |
| **Rust** (red) | #B71D2E |

### Analogous Colors

| Name       | 500     |
| ---------- | ------- |
| **Teal**   | #48C4A3 |
| **Purple** | #6955C6 |

### Neutrals & Accents

| Name              | Key Value     | Usage                              |
| ----------------- | ------------- | ---------------------------------- |
| **Beige**         | #F5F3E8 (200) | Main background / neutral surfaces |
| **Gray**          | #A8A8A8 (400) | Muted text, borders                |
| **Golden Yellow** | #F1C40F (500) | Highlights, badges                 |
| **Deep Navy**     | #0B3954 (800) | Dark backgrounds, headings         |

### Semantic Colors

| Semantic | Color  | Token                    |
| -------- | ------ | ------------------------ |
| Success  | Green  | `green-500` / `#4EB54A`  |
| Warning  | Yellow | `yellow-500` / `#F1C40F` |
| Error    | Rust   | `rust-500` / `#B71D2E`   |
| Info     | Blue   | `blue-500` / `#186DB7`   |

### Mobile-Only Tokens

| Token           | Value     | Usage                  |
| --------------- | --------- | ---------------------- |
| `background`    | `#FAF9F4` | App root background    |
| `card`          | `#FFFFFF` | Card surfaces          |
| `border`        | `#ebe8d9` | Default borders        |
| `text`          | `#212121` | Primary text           |
| `textSecondary` | `#6e6e6e` | Secondary text         |
| `textLight`     | `#A8A8A8` | Muted/placeholder text |

### Dark Mode (Web)

```css
@media (prefers-color-scheme: dark) {
  --background: #0b3954; /* Deep Navy */
  --foreground: #f5f3e8; /* Beige */
}
```

---

## Typography

### Font Families

| Role         | Font           | Fallbacks                                  | Web Class      | Mobile         |
| ------------ | -------------- | ------------------------------------------ | -------------- | -------------- |
| **Body**     | Inter          | system-ui, -apple-system, Segoe UI, Roboto | `font-sans`    | System default |
| **Headings** | Poppins        | Inter, system-ui                           | `font-heading` | System default |
| **Code**     | JetBrains Mono | Fira Code, Consolas, Monaco                | `font-mono`    | —              |

### Font Scale

| Token | Size | rem   |
| ----- | ---- | ----- |
| xs    | 12px | 0.75  |
| sm    | 14px | 0.875 |
| base  | 16px | 1     |
| lg    | 18px | 1.125 |
| xl    | 20px | 1.25  |
| 2xl   | 24px | 1.5   |
| 3xl   | 30px | 1.875 |
| 4xl   | 36px | 2.25  |
| 5xl   | 48px | 3     |
| 6xl   | 60px | 3.75  |

### Font Weights

| Token     | Value | Usage                |
| --------- | ----- | -------------------- |
| light     | 300   | Subtle text          |
| normal    | 400   | Body text            |
| medium    | 500   | Emphasis             |
| semibold  | 600   | Sub-headings, labels |
| bold      | 700   | Headings             |
| extrabold | 800   | Hero text            |

### Line Heights

`none: 1` · `tight: 1.25` · `snug: 1.375` · `normal: 1.5` · `relaxed: 1.625` · `loose: 2`

---

## Spacing & Layout

### Breakpoints

| Name | Width  |
| ---- | ------ |
| sm   | 640px  |
| md   | 768px  |
| lg   | 1024px |
| xl   | 1280px |
| 2xl  | 1536px |

### Container Widths

sm: 640px · md: 768px · lg: 1024px · xl: 1280px · 2xl: 1536px

### Layout Constants

| Token             | Value |
| ----------------- | ----- |
| Sidebar width     | 280px |
| Sidebar collapsed | 80px  |
| Header height     | 64px  |

### Mobile Spacing Scale

| Token | px  |
| ----- | --- |
| xs    | 4   |
| sm    | 8   |
| md    | 12  |
| lg    | 16  |
| xl    | 20  |
| 2xl   | 24  |
| 3xl   | 32  |
| 4xl   | 40  |
| 5xl   | 48  |

### Border Radius

| Token   | Web    | Mobile |
| ------- | ------ | ------ |
| none    | 0      | 0      |
| sm      | 2px    | 4px    |
| DEFAULT | 4px    | —      |
| md      | 6px    | 8px    |
| lg      | 8px    | 12px   |
| xl      | 12px   | 16px   |
| 2xl     | 16px   | —      |
| 3xl     | 24px   | —      |
| full    | 9999px | 9999px |

### Shadows (Mobile)

| Level | shadowOpacity | shadowRadius | elevation |
| ----- | ------------- | ------------ | --------- |
| sm    | 0.05          | 2            | 1         |
| md    | 0.1           | 4            | 3         |
| lg    | 0.15          | 8            | 5         |

---

## Transitions & Animations

### Web Transitions

| Token   | Duration | Usage               |
| ------- | -------- | ------------------- |
| fast    | 150ms    | Micro-interactions  |
| DEFAULT | 200ms    | General transitions |
| slow    | 300ms    | Panel open/close    |
| slower  | 500ms    | Page transitions    |

### Common Animation Classes (Web)

```
transition-all duration-200        → General transitions
transition-colors duration-200     → Color changes (hover states)
transition-shadow duration-200     → Shadow changes (card hover)
hover:scale-105                    → Small scale-up on hover
hover:scale-[1.02]                 → Subtle scale-up (cards)
animate-spin                       → Loading spinner
animate-pulse                      → Skeleton loaders, "Laden..." text
```

### Mobile Animations

- **Reanimated 4** for drag-and-drop (DraggableRankingList)
- **React Native Animated API** for game transitions (scale, opacity)

---

## Component Patterns

### Button Variants

Both web (`src/components/ui/Button.tsx`) and mobile (`mobile/src/components/ui/Button.tsx`) share the same variant system:

| Variant       | Background  | Text        | Hover/Active              | Usage                          |
| ------------- | ----------- | ----------- | ------------------------- | ------------------------------ |
| **primary**   | `green-500` | white       | `green-600` / `green-700` | Main actions (submit, confirm) |
| **secondary** | `blue-500`  | white       | `blue-600` / `blue-700`   | Alternative actions            |
| **outline**   | transparent | `green-600` | `green-50` bg             | Tertiary actions               |
| **ghost**     | transparent | `gray-700`  | `gray-100` bg             | Subtle actions (nav)           |
| **danger**    | `rust-500`  | white       | `rust-600` / `rust-700`   | Destructive actions (delete)   |

Sizes: `sm` (px-3 py-1.5 text-sm) · `md` (px-4 py-2 text-base) · `lg` (px-6 py-3 text-lg)

Features: `isLoading` (spinner + "Laden..."), `fullWidth`, `disabled` (opacity-50), focus ring (2px, green offset).

### Card Component

| Prop    | Options                                                |
| ------- | ------------------------------------------------------ |
| padding | `none` · `sm` (p-3) · `md` (p-6, default) · `lg` (p-8) |
| shadow  | `none` · `sm` · `md` (default) · `lg`                  |
| hover   | `true` adds `hover:shadow-lg` transition               |

Base: `bg-white rounded-xl border border-gray-200`

Sub-components: `CardHeader` · `CardTitle` · `CardDescription` · `CardContent` · `CardFooter`

### Input Component

Base: `w-full px-4 py-2 rounded-lg border transition-all duration-200`

| State   | Border             | Ring             |
| ------- | ------------------ | ---------------- |
| Default | `border-gray-300`  | —                |
| Focus   | `border-green-500` | `ring-green-200` |
| Error   | `border-rust-500`  | `ring-rust-200`  |

Label: `text-sm font-medium text-gray-700 mb-1`
Required: red asterisk (`text-rust-500`)
Error text: `text-sm text-rust-500 mt-1`
Helper text: `text-sm text-gray-500 mt-1`

### Mobile Input

Mobile also has a `PasswordInput` component with a visibility toggle eye icon.

---

## Page & Layout Patterns

### Backgrounds

| Context                              | Color                             |
| ------------------------------------ | --------------------------------- |
| Public pages (activiteiten, contact) | `bg-beige-200` (via layout)       |
| Dashboard                            | White main area with gray sidebar |
| Auth pages                           | Centered form on `bg-beige-200`   |
| Home hero                            | Video banner with dark overlay    |
| Mobile app                           | `#FAF9F4` background              |

### Activity Card Gradients

Activity pages use colorful gradient backgrounds for cards. Pattern:

```html
<div
  class="bg-gradient-to-br from-{color}-100 via-{color2}-50 to-{color3}-100 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all border border-{color}-200"
></div>
```

Common gradient combos:

- Pink/Rose/Purple: `from-pink-100 via-rose-50 to-purple-100`
- Green/Emerald/Teal: `from-emerald-100 via-green-50 to-teal-100`
- Blue/Indigo: `from-blue-100 via-indigo-50 to-blue-100`
- Strong CTA: `from-purple-500 to-pink-500` (buttons)
- Gradient text: `bg-gradient-to-r bg-clip-text text-transparent`

### Navigation

- **Navbar** (public): sticky top-0, text-gray-700, hover states use green-50/green-700
- **Sidebar** (dashboard): w-64 fixed, role-based sections with color-coded active states
- **Mobile bottom tabs**: 4 tabs (Home, Dances, Activities, Profile)

### Icons

**Heroicons** (`@heroicons/react/24/outline`) — used consistently across all web pages.

Common icons: `ChevronDownIcon`, `UserCircleIcon`, `ArrowRightOnRectangleIcon`, `Bars3Icon`, `XMarkIcon`, `AcademicCapIcon`, `HeartIcon`, `StarIcon`.

---

## File Reference

### Web

| File                                                           | Purpose                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| [src/styles/theme.ts](./src/styles/theme.ts)                   | Color palette definition (all shades)                           |
| [src/styles/typography.ts](./src/styles/typography.ts)         | Font families, sizes, weights, line heights                     |
| [src/styles/spacing.ts](./src/styles/spacing.ts)               | Spacing scale, breakpoints, border radius, shadows, transitions |
| [src/styles/index.ts](./src/styles/index.ts)                   | Re-exports all style tokens                                     |
| [src/app/globals.css](./src/app/globals.css)                   | Tailwind v4 config, CSS custom properties, dark mode            |
| [src/components/ui/Button.tsx](./src/components/ui/Button.tsx) | Button component (5 variants, 3 sizes)                          |
| [src/components/ui/Card.tsx](./src/components/ui/Card.tsx)     | Card component with sub-components                              |
| [src/components/ui/Input.tsx](./src/components/ui/Input.tsx)   | Input component with label, error, helper                       |

### Mobile

| File                                                                         | Purpose                                      |
| ---------------------------------------------------------------------------- | -------------------------------------------- |
| [mobile/src/styles/theme.ts](./mobile/src/styles/theme.ts)                   | Colors, spacing, radius, font sizes, shadows |
| [mobile/src/components/ui/Button.tsx](./mobile/src/components/ui/Button.tsx) | RN Button (same variants as web)             |
| [mobile/src/components/ui/Card.tsx](./mobile/src/components/ui/Card.tsx)     | RN Card (elevated, outlined, flat)           |
| [mobile/src/components/ui/Input.tsx](./mobile/src/components/ui/Input.tsx)   | RN Input + PasswordInput                     |

---

## Rules

1. **Always use the design tokens** — never hardcode hex colors or pixel values. Use Tailwind classes on web, theme imports on mobile.
2. **Green is the primary action color** — all primary buttons, focus rings, and interactive highlights use green-500.
3. **Rust is the danger/error color** — never use generic red; use rust-500 for errors and destructive actions.
4. **Beige is the default background** — public pages use bg-beige-200; avoid plain white backgrounds outside cards.
5. **Poppins for headings, Inter for body** — use `font-heading` for h1–h3, `font-sans` for everything else.
6. **Cards are white with rounded-xl** — use the Card component or `bg-white rounded-xl border border-gray-200`.
7. **Activity cards use gradient backgrounds** — use 3-color `bg-gradient-to-br` with matching border colors.
8. **Hover effects are subtle** — use `hover:scale-[1.02]` for cards, `hover:shadow-lg` for elevation, 200ms transitions.
9. **Loading state shows "Laden..."** — use `isLoading` prop on buttons; show `animate-pulse` for skeleton states.
10. **Mobile and web share the same color palette** — keep colors in sync between `src/styles/theme.ts` and `mobile/src/styles/theme.ts`.
11. **Dutch language throughout** — all user-facing text is in Dutch (nl-BE).
12. **Icons from Heroicons** — use `@heroicons/react/24/outline` consistently; don't mix icon libraries.
