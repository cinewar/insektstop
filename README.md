# INSEKTSTOP 🪲

A **mobile-first** static web application for a professional pest and insect control service.

## Features

- **Mobile-first responsive design** – base styles target small screens; layout expands progressively for tablet (≥ 600 px) and desktop (≥ 1024 px)
- Sticky header with hamburger navigation on mobile, inline navigation on desktop
- Hero section with clear call-to-action buttons
- Services grid (6 service cards)
- "How it works" step-by-step guide
- Stats bar and customer testimonials
- Booking / contact form with client-side validation and toast feedback
- Accessible HTML5 (ARIA labels, semantic elements, keyboard navigation)
- No build tools required – pure HTML, CSS and vanilla JavaScript

## Project structure

```
insektstop/
├── index.html      # Single-page application entry point
├── css/
│   └── style.css   # Mobile-first stylesheet
├── js/
│   └── app.js      # Navigation, form handling, toast notifications
└── README.md
```

## Getting started

Because this is a static site, no build step is needed.

**Option 1 – open directly in a browser**

```bash
open index.html   # macOS
xdg-open index.html  # Linux
```

**Option 2 – serve locally with any static server**

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

Then visit `http://localhost:8080`.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). No polyfills required.
