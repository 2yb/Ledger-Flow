# API Documentation

Base URL: `http://localhost:5000`

The examples below assume the API uses the `/api` prefix. Confirm the actual route mounting in the backend before submission.

## 1. List Accounts

**Endpoint:** `GET /api/accounts`

Returns the accounts available through the API.

## 2. Create an Account

**Endpoint:** `POST /api/accounts`

Creates a new account.

**Example request**

```json
{
  "name": "Primary Account"
}
```

Use the exact request fields required by the implemented account validator.

## 3. Get Account Transactions

**Endpoint:** `GET /api/accounts/:accountId/transactions`

Returns transaction history for the specified account.

**Query parameters**

| Parameter | Description |
|---|---|
| `page` | Page number, starting at 1 |
| `limit` | Maximum number of records per page |

**Example**

```http
GET /api/accounts/1/transactions?page=1&limit=10
```

The response should be documented using the actual JSON structure returned by the backend, including pagination metadata if provided.

## 4. Create a Transaction

**Endpoint:** `POST /api/accounts/:accountId/transactions`

Creates a credit or debit transaction for an account.

**Example request**

```json
{
  "type": "credit",
  "amount": 10000,
  "reference_id": "PAYMENT-001"
}
```

Here, `amount: 10000` represents ₹100 if the implementation stores amounts in paise.

For a debit, use `"type": "debit"` and provide a valid amount and reference.

## Validation and Error Handling

The API should reject invalid requests, including cases supported by the implementation such as:

- Invalid transaction types or amounts.
- A debit exceeding the available balance.
- A duplicate `reference_id` for the same account.
- A transaction referencing an account that does not exist.

**Example error**

```json
{
  "success": false,
  "error": {
    "message": "Insufficient balance."
  }
}
```

The HTTP status code and error body should match the actual backend response.

## Notes

- Refer to `ASSUMPTIONS.md` for the monetary unit and transaction rules.
- Use the actual account IDs returned by the API.
- Keep the database and backend running when testing endpoints.
