import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { client } from "./dynamo.js";
import { ValidationError } from "./round.js";

export namespace Board {
  export interface Info {
    roundId: string;
    playerName: string;
    cells: string[];
    marked: boolean[];
    size: 3 | 4;
    createdAt: string;
  }

  export interface BingoLine {
    type: "row" | "col" | "diagonal";
    index: number;
  }

  export interface BingoResult {
    hasBingo: boolean;
    lines: BingoLine[];
  }

  /** Fisher-Yates shuffle — unbiased */
  export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  export function generate(words: string[], size: number): string[] {
    const totalCells = size * size;
    if (words.length < totalCells) {
      throw new ValidationError(
        `Need at least ${totalCells} words for a ${size}x${size} board, got ${words.length}`,
      );
    }
    return shuffle(words).slice(0, totalCells);
  }

  export function checkBingo(marked: boolean[], size: number): BingoResult {
    const lines: BingoLine[] = [];

    // Check rows
    for (let row = 0; row < size; row++) {
      let complete = true;
      for (let col = 0; col < size; col++) {
        if (!marked[row * size + col]) {
          complete = false;
          break;
        }
      }
      if (complete) lines.push({ type: "row", index: row });
    }

    // Check columns
    for (let col = 0; col < size; col++) {
      let complete = true;
      for (let row = 0; row < size; row++) {
        if (!marked[row * size + col]) {
          complete = false;
          break;
        }
      }
      if (complete) lines.push({ type: "col", index: col });
    }

    // Check main diagonal (top-left → bottom-right)
    let diagComplete = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + i]) {
        diagComplete = false;
        break;
      }
    }
    if (diagComplete) lines.push({ type: "diagonal", index: 0 });

    // Check anti-diagonal (top-right → bottom-left)
    let antiDiagComplete = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + (size - 1 - i)]) {
        antiDiagComplete = false;
        break;
      }
    }
    if (antiDiagComplete) lines.push({ type: "diagonal", index: 1 });

    return { hasBingo: lines.length > 0, lines };
  }

  export async function create(input: {
    roundId: string;
    playerName: string;
    words: string[];
    size: 3 | 4;
  }): Promise<Info> {
    if (!input.playerName.trim()) {
      throw new ValidationError("Player name is required");
    }

    const cells = generate(input.words, input.size);
    const board: Info = {
      roundId: input.roundId,
      playerName: input.playerName.trim(),
      cells,
      marked: new Array(cells.length).fill(false),
      size: input.size,
      createdAt: new Date().toISOString(),
    };

    try {
      await client.send(
        new PutCommand({
          TableName: Resource.Boards.name,
          Item: board,
          ConditionExpression: "attribute_not_exists(roundId)",
        }),
      );
      return board;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
        const existing = await get(input.roundId, input.playerName);
        if (existing) return existing;
      }
      throw err;
    }
  }

  export async function get(roundId: string, playerName: string): Promise<Info | undefined> {
    const result = await client.send(
      new GetCommand({
        TableName: Resource.Boards.name,
        Key: { roundId, playerName },
      }),
    );
    const item = result.Item;
    return item ? (item as Info) : undefined;
  }

  export async function listByRound(roundId: string): Promise<Info[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Boards.name,
        KeyConditionExpression: "roundId = :roundId",
        ExpressionAttributeValues: { ":roundId": roundId },
      }),
    );
    return (result.Items ?? []) as Info[];
  }

  export async function markCell(
    roundId: string,
    playerName: string,
    cellIndex: number,
  ): Promise<Info> {
    if (cellIndex < 0) {
      throw new ValidationError("Cell index must be non-negative");
    }

    const board = await get(roundId, playerName);
    if (!board) {
      throw new ValidationError("Board not found");
    }

    if (cellIndex >= board.marked.length) {
      throw new ValidationError(
        `Cell index ${cellIndex} out of bounds (board has ${board.marked.length} cells)`,
      );
    }

    await client.send(
      new UpdateCommand({
        TableName: Resource.Boards.name,
        Key: { roundId, playerName },
        UpdateExpression: `SET marked[${cellIndex}] = :val`,
        ExpressionAttributeValues: { ":val": true },
        ConditionExpression: "attribute_exists(roundId)",
      }),
    );

    const updated = await get(roundId, playerName);
    if (!updated) {
      throw new ValidationError("Board not found after update");
    }
    return updated;
  }

  export async function unmarkCell(
    roundId: string,
    playerName: string,
    cellIndex: number,
  ): Promise<Info> {
    if (cellIndex < 0) {
      throw new ValidationError("Cell index must be non-negative");
    }

    const board = await get(roundId, playerName);
    if (!board) {
      throw new ValidationError("Board not found");
    }

    if (cellIndex >= board.marked.length) {
      throw new ValidationError(
        `Cell index ${cellIndex} out of bounds (board has ${board.marked.length} cells)`,
      );
    }

    await client.send(
      new UpdateCommand({
        TableName: Resource.Boards.name,
        Key: { roundId, playerName },
        UpdateExpression: `SET marked[${cellIndex}] = :val`,
        ExpressionAttributeValues: { ":val": false },
        ConditionExpression: "attribute_exists(roundId)",
      }),
    );

    const updated = await get(roundId, playerName);
    if (!updated) {
      throw new ValidationError("Board not found after update");
    }
    return updated;
  }
}
