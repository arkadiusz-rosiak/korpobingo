import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export module Player {
  export interface Info {
    roundId: string;
    playerName: string;
    joinedAt: string;
  }

  export async function register(input: {
    roundId: string;
    playerName: string;
  }): Promise<Info> {
    const player: Info = {
      roundId: input.roundId,
      playerName: input.playerName,
      joinedAt: new Date().toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: Resource.Players.name,
        Item: player,
      })
    );
    return player;
  }

  export async function get(
    roundId: string,
    playerName: string
  ): Promise<Info | undefined> {
    const result = await client.send(
      new GetCommand({
        TableName: Resource.Players.name,
        Key: { roundId, playerName },
      })
    );
    return result.Item as Info | undefined;
  }

  export async function listByRound(roundId: string): Promise<Info[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Players.name,
        KeyConditionExpression: "roundId = :roundId",
        ExpressionAttributeValues: { ":roundId": roundId },
      })
    );
    return (result.Items ?? []) as Info[];
  }
}
