# Meme Coin Aggregator Service 🚀

A real-time backend service that aggregates, merges, and caches cryptocurrency data from multiple Decentralized Exchanges (DEXs). Built for high performance with Node.js, Redis, and WebSockets.

## 🌟 Features
* **Multi-Source Aggregation:** Merges data from DexScreener and Jupiter APIs.
* **Smart Merging:** Unified data model prioritizing high-liquidity sources.
* **High Performance:** Redis caching (30s TTL) to prevent rate limits.
* **Real-Time Updates:** WebSocket (Socket.io) feeds for live price changes.
* **Resiliency:** Exponential backoff and retry logic for API stability.
* **Advanced Querying:** Sorting, filtering, and cursor-based pagination.

## 🛠️ Tech Stack
* **Runtime:** Node.js & TypeScript
* **Framework:** Express.js
* **Caching:** Redis (ioredis)
* **WebSockets:** Socket.io
* **Scheduling:** Custom background workers

## 🚀 Getting Started

### Prerequisites
* Node.js v16+
* Docker (for local Redis)

### Installation
1.  Clone the repo:
    ```bash
    git clone <your-repo-url>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally
1.  Start Redis:
    ```bash
    docker-compose up -d
    ```
2.  Start Server:
    ```bash
    npm run dev
    ```

## 📡 API Endpoints

### REST API
* `GET /api/v1/tokens` - Fetch paginated token list.
    * Query Params: `limit`, `cursor`, `sort`, `order`, `query`.

### WebSockets
* Connect to `/`
* Event: `tokens:update` - Emits top 20 trending tokens every 15s.

## 📐 Architecture Decisions
* **UnifiedToken Interface:** Created a strict normalization layer to decouple the frontend from specific API structures.
* **Cache-Aside Pattern:** The service checks Redis first. On a miss, it aggregates data, caches it, and returns it.
* **Cursor Pagination:** Chosen over offset pagination for O(1) performance on large datasets.
