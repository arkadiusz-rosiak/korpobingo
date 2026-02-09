import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { client } from "./dynamo.js";

export namespace Round {
  export interface Info {
    roundId: string;
    name: string;
    status: "collecting" | "playing" | "finished";
    shareCode: string;
    createdAt: string;
    boardSize: 3 | 4;
    roundEndsAt: string;
  }

  // Characters excluding confusing ones: 0/O, 1/I/L
  const SHARE_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const SHARE_CODE_LENGTH = 6;

  export function generateShareCode(): string {
    let code = "";
    for (let i = 0; i < SHARE_CODE_LENGTH; i++) {
      code += SHARE_CODE_CHARS[Math.floor(Math.random() * SHARE_CODE_CHARS.length)];
    }
    return code;
  }

  export async function create(input: {
    roundId: string;
    name: string;
    boardSize?: 3 | 4;
    durationDays?: number;
  }): Promise<Info> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Round name is required");
    }
    if (input.name.trim().length > 100) {
      throw new ValidationError("Round name must be 100 characters or less");
    }

    const now = new Date();
    const durationDays = input.durationDays ?? 7;
    const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const round: Info = {
      roundId: input.roundId,
      name: input.name.trim(),
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
      }),
    );
    return round;
  }

  export async function getByShareCode(shareCode: string): Promise<Info | undefined> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Rounds.name,
        IndexName: "byShareCode",
        KeyConditionExpression: "shareCode = :code",
        ExpressionAttributeValues: { ":code": shareCode.toUpperCase() },
      }),
    );
    const item = result.Items?.[0];
    return item ? (item as Info) : undefined;
  }

  export async function updateStatus(roundId: string, status: Info["status"]): Promise<void> {
    await client.send(
      new UpdateCommand({
        TableName: Resource.Rounds.name,
        Key: { roundId },
        UpdateExpression: "SET #s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": status },
        ConditionExpression: "attribute_exists(roundId)",
      }),
    );
  }

  export async function get(roundId: string): Promise<Info | undefined> {
    const result = await client.send(
      new GetCommand({
        TableName: Resource.Rounds.name,
        Key: { roundId },
      }),
    );
    const item = result.Item;
    return item ? (item as Info) : undefined;
  }

  export async function remove(roundId: string): Promise<void> {
    await client.send(
      new DeleteCommand({
        TableName: Resource.Rounds.name,
        Key: { roundId },
      }),
    );
  }

  export async function list(): Promise<Info[]> {
    const result = await client.send(
      new ScanCommand({
        TableName: Resource.Rounds.name,
      }),
    );
    return (result.Items ?? []) as Info[];
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
