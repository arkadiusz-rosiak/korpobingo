import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const SHARE_CODE = "Z6Z964";
const DURATION_DAYS = 7;
const ROUNDS_TABLE = "korpobingo-production-RoundsTable-mmxwcnka";

const client = new DynamoDBClient({ region: "eu-central-1" });
const docClient = DynamoDBDocumentClient.from(client);

async function main() {
  // First find roundId by shareCode using the existing GSI
  const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
  const result = await docClient.send(
    new QueryCommand({
      TableName: ROUNDS_TABLE,
      IndexName: "byShareCode",
      KeyConditionExpression: "shareCode = :code",
      ExpressionAttributeValues: { ":code": SHARE_CODE },
    }),
  );

  const round = result.Items?.[0];
  if (!round) {
    console.error(`Round with shareCode ${SHARE_CODE} not found!`);
    process.exit(1);
  }

  const roundId = round.roundId as string;
  console.log(`Found round: "${round.name}" (${roundId}), status: ${round.status}`);
  console.log(`Current durationDays: ${round.durationDays ?? "not set"}`);
  console.log(`Current roundEndsAt: ${round.roundEndsAt || "not set"}`);

  // Calculate new roundEndsAt if round is already playing
  const isPlaying = round.status === "playing";
  const updateExpression = isPlaying
    ? "SET durationDays = :dur, roundEndsAt = :endsAt"
    : "SET durationDays = :dur";

  const expressionValues: Record<string, unknown> = { ":dur": DURATION_DAYS };
  if (isPlaying) {
    const endsAt = new Date(Date.now() + DURATION_DAYS * 24 * 60 * 60 * 1000);
    expressionValues[":endsAt"] = endsAt.toISOString();
    console.log(`\nRound is playing — setting roundEndsAt to ${endsAt.toISOString()}`);
  }

  await docClient.send(
    new UpdateCommand({
      TableName: ROUNDS_TABLE,
      Key: { roundId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues,
    }),
  );

  console.log(`\nDone! Set durationDays=${DURATION_DAYS} for round ${SHARE_CODE}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
