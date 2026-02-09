import { createHash } from "node:crypto";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { client } from "./dynamo.js";
import { ValidationError } from "./round.js";

export namespace Player {
  export interface Info {
    roundId: string;
    playerName: string;
    pinHash: string;
    joinedAt: string;
  }

  /** Public view — never expose pinHash */
  export interface PublicInfo {
    roundId: string;
    playerName: string;
    joinedAt: string;
  }

  function hashPin(pin: string, roundId: string, playerName: string): string {
    return createHash("sha256").update(`${roundId}:${playerName}:${pin}`).digest("hex");
  }

  function toPublic(player: Info): PublicInfo {
    return {
      roundId: player.roundId,
      playerName: player.playerName,
      joinedAt: player.joinedAt,
    };
  }

  export async function register(input: {
    roundId: string;
    playerName: string;
    pin: string;
  }): Promise<PublicInfo> {
    const name = input.playerName.trim();
    if (!name) {
      throw new ValidationError("Player name is required");
    }
    if (name.length > 30) {
      throw new ValidationError("Player name must be 30 characters or less");
    }
    if (!/^\d{4}$/.test(input.pin)) {
      throw new ValidationError("PIN must be exactly 4 digits");
    }

    // Check if player already exists in this round
    const existing = await get(input.roundId, name);
    if (existing) {
      throw new ValidationError(`Player "${name}" already exists in this round`);
    }

    const player: Info = {
      roundId: input.roundId,
      playerName: name,
      pinHash: hashPin(input.pin, input.roundId, name),
      joinedAt: new Date().toISOString(),
    };

    await client.send(
      new PutCommand({
        TableName: Resource.Players.name,
        Item: player,
      }),
    );
    return toPublic(player);
  }

  export async function verifyPin(
    roundId: string,
    playerName: string,
    pin: string,
  ): Promise<boolean> {
    const player = await get(roundId, playerName);
    if (!player) return false;
    return player.pinHash === hashPin(pin, roundId, playerName);
  }

  export async function get(roundId: string, playerName: string): Promise<Info | undefined> {
    const result = await client.send(
      new GetCommand({
        TableName: Resource.Players.name,
        Key: { roundId, playerName },
      }),
    );
    const item = result.Item;
    return item ? (item as Info) : undefined;
  }

  export async function listByRound(roundId: string): Promise<PublicInfo[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Players.name,
        KeyConditionExpression: "roundId = :roundId",
        ExpressionAttributeValues: { ":roundId": roundId },
      }),
    );
    return ((result.Items ?? []) as Info[]).map(toPublic);
  }
}
