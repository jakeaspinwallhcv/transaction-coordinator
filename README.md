# Transaction Coordinator

A minimal web app to help real estate professionals coordinate tasks after a purchase and sale agreement is executed. Create transactions, add tasks, and track progress in a simple responsive interface.

## Getting Started

1. Ensure Node.js is installed.
2. Run `npm start` and open [http://localhost:3000](http://localhost:3000) in your browser.

Transactions and tasks are stored in `data/transactions.json`.

## Uploading Contracts

Upload a signed contract (JSON or text file with `property`, `buyer`, and `seller` fields) through the interface to automatically create a new transaction. Uploaded contracts are saved under `data/contracts`.

