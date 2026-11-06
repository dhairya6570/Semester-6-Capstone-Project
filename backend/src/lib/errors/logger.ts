
type ErrorLogContext = {
  route: string;
  operation: string;
};

export function logServerError(
  error: unknown,
  context: ErrorLogContext
): void {
  const timestamp = new Date().toISOString();

  const errorType =
    error instanceof Error
      ? error.name
      : "UnknownError";

  console.error(
    JSON.stringify({
      timestamp,
      level: "error",
      errorType,
      route: context.route,
      operation: context.operation,
    })
  );
}
