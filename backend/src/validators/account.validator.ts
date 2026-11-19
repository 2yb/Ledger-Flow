import { HttpError } from "../utils/http-error";

export function validateCreateAccount(body: unknown): { name: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError("Invalid request body.", 400);
  }

  const name = (body as Record<string, unknown>).name;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new HttpError("Account name must be provided.", 400);
  }

  const normalizedName = name.trim();
  if (normalizedName.length > 100) {
    throw new HttpError("Account name must be 100 characters or fewer.", 400);
  }

  return { name: normalizedName };
}