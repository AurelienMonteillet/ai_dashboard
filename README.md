# Tezos AI Dashboard

This project is a static dashboard (HTML/CSS/JS) to visualize the evolution of staking and issuance on Tezos.

## Features
- Graphical visualization of staking and issuance evolution since genesis
- Modern design with a blue-purple gradient background
- Tezos logo at the top left
- "powered by xtzchads" badge at the bottom right, linking to https://tez.cool/
- 100% static, no dependencies on React, Next.js, or Tailwind

## How to Run Locally

1. Go to the project directory:
   ```bash
   cd /opt/ai_dashboard
   ```
2. Start a local HTTP server (example with Python):
   ```bash
   python3 -m http.server 8080
   ```
3. Open your browser at:
   ```
   http://localhost:8080/charts_only.html
   ```

## Project Structure
- `charts_only.html`: main dashboard page
- `css/main.css`: main styles
- `js/`: scripts for charts (Highcharts, etc.)
- `public/tezos-logo-white.svg`: Tezos logo used in the header

## Customization
- The gradient background and header style can be changed in `css/main.css`
- To change the logo, replace the SVG file in `public/`

---

Dashboard made for the Tezos community. 