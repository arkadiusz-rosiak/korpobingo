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

function tryParseRoundId(event: ApiEvent): string | undefined {
  const fromQs = event.queryStringParameters?.roundId;
  if (fromQs) return fromQs;
  try {
    const raw = event.body
      ? event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString()
        : event.body
      : undefined;
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.roundId;
    }
  } catch {
    // Ignore parse errors — body may not be JSON
  }
  return undefined;
}

export function wrapHandler(
  fn: (event: ApiEvent) => Promise<ApiResult>,
): (event: ApiEvent) => Promise<ApiResult> {
  return async (event: ApiEvent) => {
    // Handle CORS preflight
    if (getMethod(event) === "OPTIONS") {
      return json(200, {});
    }

    const startTime = Date.now();
    const method = getMethod(event);
    const path = event.rawPath || event.requestContext?.http?.path || "unknown";
    const roundId = tryParseRoundId(event);

    let result: ApiResult;
    let isError = false;

    try {
      result = await fn(event);
    } catch (err) {
      isError = true;
      result = handleError(err);

      const errorLog: Record<string, unknown> = {
        level: "ERROR",
        method,
        path,
        roundId,
        errorType: err instanceof Error ? err.name : "Unknown",
        errorMessage: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      };
      console.log(JSON.stringify(errorLog));
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const statusCode =
      typeof result === "object" && result && "statusCode" in result
        ? (result as { statusCode: number }).statusCode
        : 0;

    if (!isError) {
      console.log(
        JSON.stringify({
          level: "INFO",
          method,
          path,
          roundId,
          statusCode,
          duration,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    // CloudWatch Embedded Metric Format
    console.log(
      JSON.stringify({
        _aws: {
          Timestamp: Date.now(),
          CloudWatchMetrics: [
            {
              Namespace: "KorpoBingo",
              Dimensions: [["Method", "Path"]],
              Metrics: [
                { Name: "RequestCount", Unit: "Count" },
                { Name: "Duration", Unit: "Milliseconds" },
                { Name: "ErrorCount", Unit: "Count" },
              ],
            },
          ],
        },
        Method: method,
        Path: path,
        RequestCount: 1,
        Duration: duration,
        ErrorCount: isError ? 1 : 0,
      }),
    );

    return result;
  };
}
