/**
 * Validates the request body used to create an account.
 *
 * Account name is required and must contain at least one
 * non-whitespace character.
 */
export function validateCreateAccount(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a valid JSON object";
  }

  const data = body as Record<string, unknown>;

  if (typeof data.name !== "string") {
    return "Account name must be provided";
  }

  if (data.name.trim().length === 0) {
    return "Account name must be provided";
  }

  if (data.name.trim().length > 100) {
    return "Account name must not exceed 100 characters";
  }

  return null;
}