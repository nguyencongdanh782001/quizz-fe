# Research: shadcn/ui + Tailwind CSS v4 Integration

## Key Findings

1. **shadcn v4 IS Tailwind v4 compatible** — shadcn uses CSS variables exclusively (`--primary`, `--background`, etc.), not Tailwind config. Tailwind v4 `@theme inline` maps CSS vars to Tailwind utilities.

2. **Override strategy**: Define custom `:root {}` tokens BEFORE importing `shadcn/tailwind.css`. The CSS cascade means your tokens win unless shadcn re-declares them.

3. **No `tailwind.config.ts`**: Tailwind v4 puts all config in CSS. Don't create `tailwind.config.ts`.

4. **All shadcn components are safe**: Button, Card, Input, Dialog, Select, Tabs, Table, Avatar, Badge, Toast — all use semantic classes (`bg-primary`, `text-muted-foreground`) that map to your CSS variables.

## Recommended globals.css Pattern

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* 1. Define M3 tokens in :root BEFORE shadcn */
:root {
  --primary: #00464a;
  --primary-foreground: oklch(0.98 0.01 180);
  --secondary: #29695b;
  --secondary-foreground: oklch(0.98 0.01 180);
  --tertiary: #663000;
  --tertiary-foreground: oklch(0.98 0.01 180);
  --background: #f3faff;
  --foreground: #071e27;
  --surface: #f3faff;
  --surface-container-low: #e6f6ff;
  --surface-container-lowest: #ffffff;
  --surface-container-highest: #cfe6f2;
  --on-surface: #071e27;
  --on-surface-variant: #3f4949;
  --destructive: #ba1a1a;
  --destructive-foreground: oklch(0.98 0 0);
  --border: #6f7979;
  --outline: #6f7979;
  --outline-variant: #bec8c9;
  --muted: #e6f6ff;
  --muted-foreground: #3f4949;
  --accent: #e6f6ff;
  --accent-foreground: #071e27;
  --card: #ffffff;
  --card-foreground: #071e27;
  --popover: #ffffff;
  --popover-foreground: #071e27;
  --radius: 0.625rem;
  --ring: #00464a;
  --input: #bec8c9;
}

/* 2. Dark mode */
.dark {
  --background: #071e27;
  --foreground: #e6f6ff;
  --primary: #acedda;
  --primary-foreground: #003338;
  --card: #112833;
  --card-foreground: #cfe6f2;
  --popover: #112833;
  --popover-foreground: #cfe6f2;
  --destructive: #ffb4ab;
  --destructive-foreground: #690005;
  --border: #3f4949;
  --muted: #1a3540;
  --muted-foreground: #8da3a3;
  --ring: #acedda;
  --input: #3f4949;
}

/* 3. Import shadcn AFTER tokens */
@import "shadcn/tailwind.css";

/* 4. Map to @theme inline */
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-tertiary: var(--tertiary);
  --color-tertiary-foreground: var(--tertiary-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-outline: var(--outline);
  --color-outline-variant: var(--outline-variant);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-surface: var(--surface);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container-lowest: var(--surface-container-lowest);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-on-surface: var(--on-surface);
  --color-on-surface-variant: var(--on-surface-variant);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Action Items
- Rewrite `app/globals.css` with this pattern
- Test Button + Card after rewrite to verify token resolution
- Use `--radius: 0.625rem` (equivalent to `xl` roundedness) as base
