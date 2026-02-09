import { NotFoundError, ValidationError } from "@korpobingo/core/round";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export type ApiEvent = APIGatewayProxyEventV2;
export type ApiResult = APIGatewayProxyResultV2;

export function getMethod(event: ApiEvent): string {
  return event.requestContext?.http?.method ?? "GET";
}

export function getParam(event: ApiEvent, name: string): string | undefined {
  return event.queryStringParameters?.[name];
}

export function parseBody(event: ApiEvent): Record<string, unknown> {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
}

export function requireParam(event: ApiEvent, name: string): string {
  const value = getParam(event, name);
  if (!value) {
    throw new ValidationError(`Missing required parameter: ${name}`);
  }
  return value;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function json(statusCode: number, body: unknown): ApiResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

export function handleError(err: unknown): ApiResult {
  if (err instanceof ValidationError) {
    return json(400, { error: err.message, code: "VALIDATION_ERROR" });
  }
  if (err instanceof NotFoundError) {
    return json(404, { error: err.message, code: "NOT_FOUND" });
  }
  // DynamoDB ConditionalCheckFailedException
  if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
    return json(409, { error: "Conflict: condition not met", code: "CONFLICT" });
  }
  console.error(err);
  return json(500, { error: "Internal server error", code: "INTERNAL_ERROR" });
}

export function wrapHandler(
  fn: (event: ApiEvent) => Promise<ApiResult>,
): (event: ApiEvent) => Promise<ApiResult> {
  return async (event: ApiEvent) => {
    // Handle CORS preflight
    if (getMethod(event) === "OPTIONS") {
      return json(200, {});
    }
    try {
      return await fn(event);
    } catch (err) {
      return handleError(err);
    }
  };
}
