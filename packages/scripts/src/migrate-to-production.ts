import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const ROUND_ID = "62367874-030a-4692-99e2-75c8ff9a66dc";

const TABLE_MAP = {
  rounds: {
    dev: "korpobingo-arek-RoundsTable-baoaknnk",
    prod: "korpobingo-production-RoundsTable-mmxwcnka",
  },
  words: {
    dev: "korpobingo-arek-WordsTable-vrczzmre",
    prod: "korpobingo-production-WordsTable-tmuwwzha",
  },
  players: {
    dev: "korpobingo-arek-PlayersTable-bckbdbhm",
    prod: "korpobingo-production-PlayersTable-trvsvwcb",
  },
  boards: {
    dev: "korpobingo-arek-BoardsTable-bdunrohn",
    prod: "korpobingo-production-BoardsTable-emsstexa",
  },
};

const client = new DynamoDBClient({ region: "eu-central-1" });
const docClient = DynamoDBDocumentClient.from(client);

async function queryAllByRoundId(tableName: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "roundId = :rid",
        ExpressionAttributeValues: { ":rid": ROUND_ID },
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

async function batchWrite(tableName: string, items: Record<string, unknown>[]): Promise<void> {
  // BatchWriteItem supports max 25 items per call
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      })
    );
  }
}

async function main() {
  console.log(`Migrating round ${ROUND_ID} from dev to production...\n`);

  // 1. Read round
  const roundResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_MAP.rounds.dev,
      Key: { roundId: ROUND_ID },
    })
  );
  const round = roundResult.Item;
  if (!round) {
    console.error("Round not found in dev table!");
    process.exit(1);
  }
  console.log(`Round: "${round.name}" (status: ${round.status}, shareCode: ${round.shareCode})`);

  // 2. Query related items
  const [words, players, boards] = await Promise.all([
    queryAllByRoundId(TABLE_MAP.words.dev),
    queryAllByRoundId(TABLE_MAP.players.dev),
    queryAllByRoundId(TABLE_MAP.boards.dev),
  ]);

  console.log(`Words: ${words.length} items`);
  console.log(`Players: ${players.length} items`);
  console.log(`Boards: ${boards.length} items`);

  // 3. Write to production
  console.log("\nWriting to production tables...");

  await batchWrite(TABLE_MAP.rounds.prod, [round]);
  console.log("  Rounds: 1 item written");

  await batchWrite(TABLE_MAP.words.prod, words);
  console.log(`  Words: ${words.length} items written`);

  await batchWrite(TABLE_MAP.players.prod, players);
  console.log(`  Players: ${players.length} items written`);

  await batchWrite(TABLE_MAP.boards.prod, boards);
  console.log(`  Boards: ${boards.length} items written`);

  const total = 1 + words.length + players.length + boards.length;
  console.log(`\nMigration complete! ${total} items written to production.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
