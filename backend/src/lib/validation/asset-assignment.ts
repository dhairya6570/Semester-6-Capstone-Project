
export interface AssignAssetInput {
  userId: string;
}

export interface AssignAssetValidationResult {
  valid: boolean;
  error?: string;
  data?: AssignAssetInput;
}

export function validateAssignAsset(
  body: unknown
): AssignAssetValidationResult {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return {
      valid: false,
      error: "Invalid request body.",
    };
  }

  const input = body as Record<string, unknown>;
  const fields = Object.keys(input);

  if (
    fields.length !== 1 ||
    !Object.prototype.hasOwnProperty.call(input, "userId")
  ) {
    return {
      valid: false,
      error: "Only the userId field is required.",
    };
  }

  if (typeof input.userId !== "string") {
    return {
      valid: false,
      error: "A valid employee ID is required.",
    };
  }

  const userId = input.userId.trim();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(userId)) {
    return {
      valid: false,
      error: "A valid employee ID is required.",
    };
  }

  return {
    valid: true,
    data: {
      userId,
    },
  };
}
