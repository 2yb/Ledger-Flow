# Assumptions and Design Decisions

## 1. Monetary Representation

Transaction amounts and account balances are represented as integer values in paise to avoid floating-point rounding errors.

For example, ₹100 is represented as `10000`.

Amounts must be positive.

## 2. Transaction Types

The application supports two transaction types:

- **Credit:** Adds the transaction amount to the account balance.
- **Debit:** Subtracts the transaction amount from the account balance.

## 3. Insufficient Balance

A debit must not exceed the account's available balance. An invalid debit is rejected, and the account balance must remain unchanged.

## 4. Duplicate References

A transaction reference must be unique within an account. The same reference may be used for a different account if the database constraint and application logic permit it.

## 5. Account Validation

Transactions must reference an existing account. Invalid account references are rejected.

## 6. Transaction History

Transaction history supports pagination using a page number and page size. The API should return records in a deterministic order so that pagination is predictable.

## 7. Data Integrity

Database constraints are used where applicable to enforce valid transaction types, positive amounts, non-negative balances, valid account references, and unique transaction references.

## 8. Error Handling

Invalid requests and business-rule violations return appropriate HTTP error responses with a consistent error structure.

## 9. Scope

Authentication, authorization, and production deployment are outside the current scope unless explicitly implemented as part of the assignment.
