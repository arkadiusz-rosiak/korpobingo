import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export module Round {
  export interface Info {
    roundId: string;
    name: string;
    status: "lobby" | "collecting" | "voting" | "playing" | "finished";
    createdAt: string;
    boardSize: number;
  }

  export async function create(input: {
    roundId: string;
    name: string;
    boardSize?: number;
  }): Promise<Info> {
    const round: Info = {
      roundId: input.roundId,
      name: input.name,
      status: "lobby",
      createdAt: new Date().toISOString(),
      boardSize: input.boardSize ?? 5,
    };
    await client.send(
      new PutCommand({
        TableName: Resource.Rounds.name,
        Item: round,
      })
    );
    return round;
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
