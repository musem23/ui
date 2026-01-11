# Brand UI

Lightweight UI components for React and vanilla JavaScript.

## Vanilla (No Framework)

Copy the `release/` folder to your project:

```text
release/
├── brand-ui.min.css  (162 KB)
├── brand-ui.min.js   (212 KB)
└── fonts/
```

```html
<link rel="stylesheet" href="release/brand-ui.min.css">
<script src="release/brand-ui.min.js"></script>
```

## React

Copy `react/components/ui/` to your project.

Requires: `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`

## Build

```bash
bun install
bun run build:vanilla   # Generates dist/ and release/
bun dev                 # Dev server at localhost:4000
```
