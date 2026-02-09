import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export module Round {
  export interface Info {
    roundId: string;
    name: string;
    status: "collecting" | "playing" | "finished";
    shareCode: string;
    createdAt: string;
    boardSize: 3 | 4;
    roundEndsAt: string;
  }

  function generateShareCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  export async function create(input: {
    roundId: string;
    name: string;
    boardSize?: 3 | 4;
    durationDays?: number;
  }): Promise<Info> {
    const now = new Date();
    const durationDays = input.durationDays ?? 7;
    const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const round: Info = {
      roundId: input.roundId,
      name: input.name,
      status: "collecting",
      shareCode: generateShareCode(),
      createdAt: now.toISOString(),
      boardSize: input.boardSize ?? 4,
      roundEndsAt: endsAt.toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: Resource.Rounds.name,
        Item: round,
      })
    );
    return round;
  }

  export async function getByShareCode(shareCode: string): Promise<Info | undefined> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Rounds.name,
        IndexName: "byShareCode",
        KeyConditionExpression: "shareCode = :code",
        ExpressionAttributeValues: { ":code": shareCode },
      })
    );
    return (result.Items?.[0] as Info) ?? undefined;
  }

  export async function updateStatus(
    roundId: string,
    status: Info["status"]
  ): Promise<void> {
    await client.send(
      new UpdateCommand({
        TableName: Resource.Rounds.name,
        Key: { roundId },
        UpdateExpression: "SET #s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": status },
      })
    );
  }

  export async function get(roundId: string): Promise<Info | undefined> {
    const result = await client.send(
      new GetCommand({
        TableName: Resource.Rounds.name,
        Key: { roundId },
      })
    );
    return result.Item as Info | undefined;
  }

  export async function remove(roundId: string): Promise<void> {
    await client.send(
      new DeleteCommand({
        TableName: Resource.Rounds.name,
        Key: { roundId },
      })
    );
  }

  export async function list(): Promise<Info[]> {
    const result = await client.send(
      new ScanCommand({
        TableName: Resource.Rounds.name,
      })
    );
    return (result.Items ?? []) as Info[];
  }
}
