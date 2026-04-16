<!--
	README for Ulrich's portfolio project.
	This file describes the portfolio structure, functionality, and local run instructions.
-->

# Ulrich Portfolio

A polished static portfolio website for **Geyek Ulrich Armel**, a Python backend developer and AWS solutions architect. This project presents a modern, responsive portfolio with interactive navigation, theme switching, a startup loader, chatbot assistant, and backend/cloud-focused content sections.

## Project Overview

This repository contains a single-page portfolio website built with:
- `HTML` for page structure
- `CSS` for responsive layout, section styling, and theme support
- `JavaScript` for interactive behaviors, navigation, theme persistence, and chatbot UI

The portfolio is designed to highlight Ulrich's backend engineering experience, technology stack, learning path, blog notes, tools, certifications, and contact information.

## Key Features

- Responsive sticky navigation with mobile hamburger menu
- Theme switcher with saved preference support (`modern-dark`, `light`, `white`, `terminal`)
- Page loading screen with animated progress indicator
- Chatbot-style visitor assistant for contact and portfolio guidance
- GitHub stats and contribution visuals loaded dynamically
- Clean section layout for `Home`, `About`, `Skills`, `Tools`, `Blog`, `Experience`, `Learning`, `Education`, and `Contact`
- Smooth scroll navigation and section active highlighting
- Mobile-friendly card grids and collapsible menu

## Sections Included

1. `Home` - Hero introduction and visual first impression
2. `About` - Professional summary and core strengths
3. `Skills` - Backend, cloud, database, DevOps and security skills
4. `Tools` - Essential development and infrastructure tools
5. `Blog` - Short note previews about backend and cloud topics
6. `Experience` - Current focus programs and project activities
7. `Learning` - Ongoing certifications and professional growth
8. `Education` - Academic foundation and training history
9. `Contact` - Email, LinkedIn, GitHub contact cards

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap bundle for optional responsive support
- Font Awesome icons
- CSS custom properties for theme variants

## Repository Structure

```
ulrich-portfolio/
├── index.html
├── README.md
├── .gitignore
├── .env
├── ap.png
└── req/
		├── css/
		│   └── backend-devops-theme.css
		├── js/
		│   ├── chatbot.js
		│   ├── github-stats.js
		│   ├── material-3.js
		│   ├── styles.js
		│   └── theme-switcher.js
		├── img/
		├── fonts/
		└── ...
```

## Getting Started

### Run locally

This is a static site, so you can preview it directly in the browser or serve it locally with a simple HTTP server.

Option 1: Open `index.html` in your browser.

Option 2: Use Python's built-in server:

```bash
cd /home/ulrich/Downloads/ulrich-portfolio/ulrich-portfolio
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## How the Interactive Parts Work

- `req/js/material-3.js` handles the startup loader, smooth scrolling, navigation visibility, and entrance animations.
- `req/js/theme-switcher.js` builds the theme selector, remembers the selected theme in `localStorage`, and applies it on every visit.
- `req/js/chatbot.js` powers the chatbot assistant, visitor interaction state, and contact helper UI.
- `req/js/github-stats.js` fetches GitHub activity or repo stats and renders them in the portfolio.

## Notes

- The project is intentionally structured as a static portfolio, so no build system is required.
- If a GitHub push is blocked by secret scanning, remove any exposed API key or token from the repository and history before retrying.
- All styling is centralized in `req/css/backend-devops-theme.css`, while JavaScript behavior is split across the `req/js/` folder.

## Customization

To personalize the portfolio:
- update the hero text and section copy in `index.html`
- modify the theme palette in `req/css/backend-devops-theme.css`
- change contact links in `req/js/chatbot.js` and `index.html`
- adjust the loader or chatbot experience in `req/js/material-3.js` and `req/js/chatbot.js`

## License

Use this project as the foundation for your personal portfolio or developer demo. Add a license file if you want to publish it under a specific open source license.
