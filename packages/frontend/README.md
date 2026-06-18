# ShopAdmin Frontend

Next.js 14 admin dashboard with TypeScript and Chakra UI for managing multi-store orders.

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API configuration
   ```

2. **Development**
   ```bash
   yarn dev
   ```

3. **Build**
   ```bash
   yarn build
   yarn start
   ```

## Features

- **Dashboard**: Overview of orders, stores, and analytics
- **Order Management**: CRUD operations for orders
- **Multi-Store Support**: Manage orders from multiple connected stores
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live order status updates
- **Export Functionality**: Export orders to various formats

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Chakra UI
- **Icons**: React Icons (Feather Icons)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
└── types/               # TypeScript type definitions
```

## Development

- Frontend runs on `http://localhost:3000`
- API proxy configured to `http://localhost:3001`
- Hot reload enabled for development
- Chakra UI provides consistent design system
