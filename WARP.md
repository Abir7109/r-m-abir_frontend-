# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A static single-page portfolio website with a cyberpunk-blue aesthetic. Built with vanilla HTML/CSS/JavaScript - no frameworks or build tools. Features a Progressive Web App (PWA) with offline support via service worker.

**Stack:** HTML5, CSS3 (CSS Variables), Vanilla JavaScript (ES6+), PWA

## Development Commands

### Running the Site

This is a static site with no build process. To run locally:

```powershell
# Option 1: Python HTTP server
python -m http.server 8000

# Option 2: Node.js http-server (if installed globally)
npx http-server -p 8000

# Then open http://localhost:8000
```

**Important:** Must be served via HTTP (not opened as `file://`) for service worker and PWA features to function correctly.

### Testing PWA Features

1. Open in browser with DevTools
2. Navigate to Application > Service Workers to verify registration
3. Use Application > Manifest to test PWA installability
4. Test offline mode by toggling network in DevTools

### Content Updates

**Update resume:** Replace `assets/resume.pdf`
**Update portrait:** Replace `assets/img/hero.jpg` (hero section) and `assets/img/abir2.jpg` (about section)
**Update projects:** Edit project cards directly in `index.html` (lines ~240-386)
**Update blog posts:** Edit `posts` array in `assets/js/main.js` (lines ~356-424)
**PWA icons:** Add `assets/icons/icon-192.png` and `assets/icons/icon-512.png`

## Architecture Overview

### Core Structure

```
├── index.html          # Main single-page application
├── admin.html          # Simple local analytics dashboard
├── service-worker.js   # PWA offline caching
├── manifest.webmanifest # PWA manifest
└── assets/
    ├── css/styles.css  # Complete styling (~2500+ lines)
    ├── js/main.js      # All JavaScript (~755 lines, IIFE pattern)
    ├── img/            # Images and project screenshots
    └── icons/          # Logo and PWA icons
```

### JavaScript Architecture (`assets/js/main.js`)

Single IIFE (Immediately Invoked Function Expression) containing all logic. No modules or bundlers.

**Key patterns:**
- **Helper functions at top:** `qs()` and `qsa()` for DOM selection
- **LocalStorage-driven state:** Theme, language, favorites, analytics, blog view preferences
- **Event-driven interactions:** No state management library; direct DOM manipulation
- **Intersection Observers:** For scroll-triggered animations (project cards, skills, journey)

**Major feature blocks (in order):**
1. **Theme & Navigation** (lines 6-41): Dark/light mode toggle, sticky header, mobile nav
2. **Typewriter Effect** (43-60): Hero subtitle animation cycling through phrases
3. **Projects** (62-225): Filtering, favorites (localStorage), share buttons, tilt effects, modal, Open Graph thumbnail fetching
4. **Skills Animation** (609-652): Progress bars and circular SVG progress indicators triggered on scroll
5. **Journey Route** (253-353): Animated SVG path with checkpoints, scroll-linked progress
6. **Blog** (355-553): Client-side search, tag filtering, sorting, grid/list view, post removal (localStorage)
7. **Contact Form** (671-685): Client-side demo submission (logs to localStorage; integrate backend if needed)
8. **Chatbot Assistant** (694-732): Toy bot with keyword-based responses
9. **Analytics** (734-744): Basic local visit/click tracking (localStorage)
10. **i18n** (654-669): EN/JA language toggle using simple string dictionary

### CSS Architecture (`assets/css/styles.css`)

**Theme system:** CSS Variables in `:root` with `data-theme='light'` override
**Color palette:**
- Header: `#0C2B4E`
- Accents: `#1A3D64`, `#1D546C`
- Text/Background: `#F4F4F4`
- Highlight: `#9fd3ff` (cyan-blue)

**Key techniques:**
- **Glass morphism:** `backdrop-filter: blur()` for cards
- **Tilt effects:** JavaScript-driven `transform: perspective() rotateX() rotateY()` with CSS variables
- **SVG animations:** Journey route uses `stroke-dasharray` and `stroke-dashoffset` for path drawing
- **Accessibility:** Contrast toggle, focus states, `prefers-reduced-motion` checks in JS

### Data Flow

**Projects:**
- Metadata stored in `data-*` attributes on `.project-card` elements in HTML
- JavaScript reads attributes to populate modals, handle filtering, fetch Open Graph images

**Blog:**
- Posts array hardcoded in `main.js` (lines 356-424)
- Rendered dynamically to `#blogList` based on search/filter/sort state

**Analytics:**
- Visits/clicks stored in `localStorage.analytics`
- Admin dashboard (`admin.html`) reads from localStorage and visualizes with Chart.js

**Favorites:**
- Project favorites stored as Set in `localStorage['favorites:v1']`
- Toggled via heart button; persists across sessions

## Customization Points

### Adding a New Project

1. Copy an existing `<article class="project-card neo">` block in `index.html`
2. Update attributes: `data-tech`, `data-rank`, `data-live`, `data-repo`
3. Replace thumbnail path in inline `style="background: url(...)"`
4. Update text: `.name`, `.desc`, badges, bullets, footer links
5. Optionally add case study in `<details class="case" id="case-{id}">`

### Adding a Blog Post

Edit `posts` array in `main.js` (~line 356):
```javascript
{
  id: 'unique-slug',
  title: 'Post Title',
  tags: ['design', 'devops', 'culture'],
  date: 'YYYY-MM-DD',
  excerpt: 'Short summary...',
  img: '/assets/img/blog/thumbnail.svg',
  content: `<p>Full HTML content...</p>`
}
```

### Changing Color Scheme

Edit CSS variables in `assets/css/styles.css` (lines 2-17):
- `--c-bg`: Main background
- `--c-bg-soft`: Softer background (cards, buttons)
- `--c-accent`: Primary accent (buttons, active states)
- `--c-text`: Main text color
- `--c-muted`: Secondary text color

Update both `:root` (dark theme) and `:root[data-theme='light']` blocks.

### Service Worker Cache

When updating assets, increment cache version in `service-worker.js`:
```javascript
const CACHE = 'abir71-v43'; // Bump version number
```

## Accessibility Features

- Skip link for keyboard navigation
- ARIA labels on interactive elements
- Focus management in modals
- Contrast toggle for high-contrast mode
- `prefers-reduced-motion` respected in JavaScript for tilt effects
- Keyboard shortcuts: Press `f` on focused project card to favorite

## Browser Requirements

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- Intersection Observer API (all modern browsers)
- CSS Grid and Flexbox
- Service Worker API for PWA features

## Performance Notes

- **Lazy loading:** Blog post thumbnails use `loading="lazy"`
- **Passive event listeners:** Scroll events use `{ passive: true }`
- **RequestAnimationFrame:** All scroll-linked animations use RAF for smooth 60fps
- **Debouncing:** Not implemented; search input triggers render directly (consider adding for large blog lists)
- **CSS containment:** Could add `contain: layout style paint` to project cards for better scroll performance

## File Size Considerations

- `assets/js/main.js`: ~30KB (755 lines, highly commented)
- `assets/css/styles.css`: ~80KB+ (2500+ lines with detailed styling)
- Consider minification if performance becomes an issue

## Integration Points

### Contact Form Backend

Currently logs to localStorage. To integrate real backend:
1. Keep form `action` pointing to Formspree or custom endpoint
2. Remove `e.preventDefault()` in submit handler (line 674)
3. Or use Fetch API to submit to custom endpoint while keeping client-side validation

### Chatbot Enhancement

Toy implementation (lines 694-732). To upgrade:
- Replace `botReply()` function with API call to LLM service
- Add streaming response handling
- Store conversation history

### Analytics Backend

Replace localStorage analytics (lines 734-744) with:
- Google Analytics 4
- Plausible
- Self-hosted solution (e.g., umami)

Keep `admin.html` or replace with real dashboard.

## Social Links

Update social media URLs in `index.html`:
- About section: lines ~76-89
- Contact section: lines ~463-474

Current placeholders: `https://github.com/`, `https://linkedin.com/`, etc.

## Common Gotchas

1. **Service worker caching:** After updating assets, users may see stale content until cache version is bumped
2. **URL paths:** All asset paths are absolute (e.g., `/assets/...`); ensure server serves from root
3. **Open Graph fetching:** Project thumbnails auto-fetch from live URLs using Jina.ai proxy (may fail for some sites)
4. **LocalStorage limits:** Analytics and favorites stored in localStorage (~5-10MB limit per origin)
5. **CSS specificity:** Heavy use of class selectors; avoid ID selectors for styling
6. **No fallbacks for older browsers:** ES6+ syntax used throughout; no transpilation

## Future Enhancement Ideas

- Add TypeScript for type safety
- Implement actual backend for contact form and analytics
- Add blog post markdown support with frontmatter
- Optimize with lazy-loaded JavaScript modules
- Add unit tests for utility functions
- Implement image optimization pipeline
- Add RSS feed for blog posts
