# Ledger Flow

A full-stack account and transaction management application that provides a simple ledger interface for creating accounts, recording credits/debits, maintaining account balances, and viewing transaction history.

## Features

### Account Management
- Create new accounts
- View all accounts
- Select an account to manage
- Display current account balance
- Account-level transaction history

### Transaction Management
- Create credit transactions
- Create debit transactions
- Reference ID for transaction tracking
- Optional transaction description
- Automatic balance calculation
- Prevent debit transactions when the account has insufficient balance
- Prevent duplicate transaction reference IDs
- Transaction history sorted by creation time

### Transaction History
- Paginated transaction history
- Displays:
  - Reference ID
  - Transaction type
  - Description
  - Amount
  - Creation date/time
- Separate handling for credit and debit transactions

### Validation & Error Handling
- Amount must be greater than zero
- Required reference ID validation
- Duplicate reference ID validation
- Insufficient balance validation for debits
- API errors are returned using a consistent response structure
- Loading states are displayed in the UI

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Fetch API

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs

### Database
- SQLite

## Project Structure

```text
ledger-flow/
├── backend/
│   ├── src/
│   ├── ...
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── ...
│   │   └── App.tsx
│   ├── ...
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js 18+
- npm

Verify:

```bash
node --version
npm --version
```

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure environment variables using the provided `.env.example` file.

Create a `.env` file locally:

```env
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

## Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## API Endpoints

### Accounts

#### Get all accounts

```http
GET /api/accounts
```

#### Create an account

```http
POST /api/accounts
```

Example:

```json
{
  "name": "Savings Account"
}
```

### Transactions

#### Get account transactions

```http
GET /api/accounts/:accountId/transactions?page=1&limit=50
```

#### Create a transaction

```http
POST /api/accounts/:accountId/transactions
```

Credit example:

```json
{
  "type": "credit",
  "amount": 10000,
  "description": "Initial deposit",
  "reference_id": "REF-001"
}
```

Debit example:

```json
{
  "type": "debit",
  "amount": 3000,
  "description": "Payment",
  "reference_id": "REF-002"
}
```

> Transaction amounts are represented in the smallest currency unit by the API. For INR, `10000` represents ₹100.00.

## API Response Format

Successful responses follow the general structure:

```json
{
  "success": true,
  "data": {}
}
```

Error responses follow:

```json
{
  "success": false,
  "error": {
    "message": "Insufficient balance."
  }
}
```

## Business Rules

### Credits

A credit transaction increases the account balance.

```text
New Balance = Current Balance + Credit Amount
```

### Debits

A debit transaction decreases the account balance.

```text
New Balance = Current Balance - Debit Amount
```

A debit cannot be created when the requested amount is greater than the available account balance.

Example error:

```text
Insufficient balance.
```

### Duplicate References

Transaction reference IDs are used to identify transactions and duplicate references are rejected according to the application's validation rules.

## Pagination

Transaction history supports pagination using:

```text
?page=1&limit=50
```

This prevents the application from loading an unnecessarily large transaction history in a single request.

## Error Handling

The application handles common failure scenarios including:

- Invalid transaction amount
- Missing required fields
- Duplicate transaction reference
- Insufficient account balance
- Invalid account
- Failed API requests
- Loading states during API operations

## Running the Application

Start the backend first:

```bash
cd backend
npm install
npm run dev
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Environment Variables

Do not commit actual secrets or private credentials to the repository.

Use `.env.example` to document required environment variables:

```env
PORT=5000
```

Create your local `.env` from this file.

## Testing

The application can be manually tested through the UI using the following scenarios:

1. Create an account.
2. Select the account.
3. Create a credit transaction.
4. Verify the balance increases.
5. Create a debit transaction.
6. Verify the balance decreases.
7. Attempt a debit greater than the available balance.
8. Verify that the transaction is rejected.
9. Attempt a duplicate transaction reference.
10. Verify that the duplicate is rejected.
11. Create enough transactions to verify pagination.
12. Verify transaction history and ordering.

## Design

The frontend is organized into reusable React components for:

- Account creation
- Account display
- Transaction creation
- Transaction history

The application separates account management from transaction management while keeping the selected account context available throughout the workspace.

## Repository

GitHub:

https://github.com/2yb/ledger-flow