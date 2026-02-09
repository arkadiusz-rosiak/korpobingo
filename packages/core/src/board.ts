import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export module Board {
  export interface Info {
    roundId: string;
    playerName: string;
    cells: string[];
    marked: boolean[];
    size: number;
    createdAt: string;
  }

  export function generate(words: string[], size: number): string[] {
    const totalCells = size * size;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalCells);
  }

  export function checkBingo(marked: boolean[], size: number): boolean {
    // Sprawdź wiersze
    for (let row = 0; row < size; row++) {
      let rowComplete = true;
      for (let col = 0; col < size; col++) {
        if (!marked[row * size + col]) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) return true;
    }

    // Sprawdź kolumny
    for (let col = 0; col < size; col++) {
      let colComplete = true;
      for (let row = 0; row < size; row++) {
        if (!marked[row * size + col]) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) return true;
    }

    // Sprawdź przekątną (lewy górny -> prawy dolny)
    let diagComplete = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + i]) {
        diagComplete = false;
        break;
      }
    }
    if (diagComplete) return true;

    // Sprawdź przekątną (prawy górny -> lewy dolny)
    let antiDiagComplete = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + (size - 1 - i)]) {
        antiDiagComplete = false;
        break;
      }
    }
    if (antiDiagComplete) return true;

    return false;
  }

  export async function create(input: {
    roundId: string;
    playerName: string;
    words: string[];
    size: number;
  }): Promise<Info> {
    const cells = generate(input.words, input.size);
    const board: Info = {
      roundId: input.roundId,
      playerName: input.playerName,
      cells,
      marked: new Array(cells.length).fill(false),
      size: input.size,
      createdAt: new Date().toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: Resource.Boards.name,
        Item: board,
      })
    );
    return board;
  }

  export async function get(
    roundId: string,
    playerName: string
  ): Promise<Info | undefined> {
    const result = await client.send(
      new GetCommand({
        TableName: Resource.Boards.name,
        Key: { roundId, playerName },
      })
    );
    return result.Item as Info | undefined;
  }

  export async function markCell(
    roundId: string,
    playerName: string,
    cellIndex: number
  ): Promise<void> {
    await client.send(
      new UpdateCommand({
        TableName: Resource.Boards.name,
        Key: { roundId, playerName },
        UpdateExpression: "SET marked[#idx] = :val",
        ExpressionAttributeNames: { "#idx": String(cellIndex) },
        ExpressionAttributeValues: { ":val": true },
      })
    );
  }
}
