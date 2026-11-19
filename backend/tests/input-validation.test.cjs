const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateCreateAccount,
} = require("../dist/validators/account.validator.js");
const {
  validateCreateTransaction,
  validatePagination,
} = require("../dist/validators/transaction.validator.js");

test("account names are trimmed before persistence", () => {
  assert.deepEqual(validateCreateAccount({ name: "  Main account  " }), {
    name: "Main account",
  });
});

test("account names over the database limit are rejected", () => {
  assert.throws(
    () => validateCreateAccount({ name: "a".repeat(101) }),
    { statusCode: 400 },
  );
});

test("transaction inputs normalize references and preserve paise", () => {
  assert.deepEqual(
    validateCreateTransaction(
      {
        type: "credit",
        amount: 12550,
        reference_id: "  REF-125  ",
        description: "  Deposit  ",
      },
      7,
    ),
    {
      accountId: 7,
      type: "credit",
      amount: 12550,
      referenceId: "REF-125",
      description: "Deposit",
    },
  );
});

test("unsafe transaction amounts are rejected", () => {
  assert.throws(
    () =>
      validateCreateTransaction(
        {
          type: "debit",
          amount: Number.MAX_SAFE_INTEGER + 1,
          reference_id: "REF-UNSAFE",
        },
        7,
      ),
    { statusCode: 400 },
  );
});

test("pagination limits are bounded", () => {
  assert.deepEqual(validatePagination("2", "100"), {
    page: 2,
    limit: 100,
  });
  assert.throws(() => validatePagination("1", "101"), {
    statusCode: 400,
  });
});
