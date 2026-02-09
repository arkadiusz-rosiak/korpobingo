import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export module Word {
  export interface Info {
    roundId: string;
    wordId: string;
    text: string;
    submittedBy: string;
    votes: number;
    createdAt: string;
  }

  export async function submit(input: {
    roundId: string;
    wordId: string;
    text: string;
    submittedBy: string;
  }): Promise<Info> {
    const word: Info = {
      roundId: input.roundId,
      wordId: input.wordId,
      text: input.text,
      submittedBy: input.submittedBy,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: Resource.Words.name,
        Item: word,
      })
    );
    return word;
  }

  export async function vote(roundId: string, wordId: string): Promise<void> {
    await client.send(
      new UpdateCommand({
        TableName: Resource.Words.name,
        Key: { roundId, wordId },
        UpdateExpression: "SET votes = votes + :inc",
        ExpressionAttributeValues: { ":inc": 1 },
      })
    );
  }

  export async function listByRound(roundId: string): Promise<Info[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Words.name,
        KeyConditionExpression: "roundId = :roundId",
        ExpressionAttributeValues: { ":roundId": roundId },
      })
    );
    return (result.Items ?? []) as Info[];
  }

  export async function listByVotes(roundId: string): Promise<Info[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Words.name,
        IndexName: "byVotes",
        KeyConditionExpression: "roundId = :roundId",
        ExpressionAttributeValues: { ":roundId": roundId },
        ScanIndexForward: false,
      })
    );
    return (result.Items ?? []) as Info[];
  }
}
