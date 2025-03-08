# CLAUDE.md - Repository Guidelines

## Build/Development Commands
- `make dev` - Run dev server with browser-sync and file watching
- `make postprocess` - Process CSS with autoprefixer
- `make dist` - Build production-ready files
- `npx postcss styles/*.css --use autoprefixer --replace` - Process CSS with autoprefixer
- `browser-sync start --server --files "styles/*.css"` - Start dev server with file watching

## Code Style Guidelines
- **HTML**: Use semantic HTML5 elements, single quotes for attributes
- **CSS**: Follow modern CSS patterns with CSS variables for theming
- **Naming**: Use kebab-case for CSS classes/IDs and file names
- **Formatting**: 2-space indentation, no trailing whitespace
- **SVG**: Include accessible attributes (role, aria-label) for icons
- **Accessibility**: Ensure proper contrast, keyboard navigation, and ARIA attributes
- **Responsive**: Mobile-first approach with appropriate media queries
- **Performance**: Preload critical assets, optimize image files
- **Comments**: Use descriptive comments for complex code sections