# Tezos Adaptive Issuance Dashboard

An interactive dashboard to visualize Tezos adaptive issuance and staking history. This project is inspired by and based on [xtzchads/ai.tez.cool](https://github.com/xtzchads/ai.tez.cool).

## Features

- Historical issuance rate visualization since genesis
- Historical staking ratio visualization since genesis
- Important protocol update markers (Hangzhou, Paris, Quebec)
- Responsive interface with Bootstrap
- TzKT API integration for real-time data

## Technologies

- Next.js 14
- TypeScript
- Highcharts
- Bootstrap
- TzKT API

## Installation

```bash
# Clone the repository
git clone https://github.com/AurelienMonteillet/ai_dashboard.git

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Project Structure

```
src/
  ├── app/
  │   ├── components/
  │   │   └── HistoricalChart.tsx
  │   ├── services/
  │   │   └── tzkt-api.ts
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx
  └── ...
```

## Credits

This project is a modern reimplementation of [xtzchads/ai.tez.cool](https://github.com/xtzchads/ai.tez.cool), using Next.js and TypeScript. The original visualization concept and design were created by the xtzchads team.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
