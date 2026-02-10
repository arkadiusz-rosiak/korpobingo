import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { client } from "./dynamo.js";
import { ValidationError } from "./round.js";

export namespace Word {
  export interface Info {
    roundId: string;
    wordId: string;
    text: string;
    submittedBy: string;
    votes: number;
    votedBy: string[];
    createdAt: string;
  }

  export async function submit(input: {
    roundId: string;
    wordId: string;
    text: string;
    submittedBy: string;
  }): Promise<Info> {
    const trimmed = input.text.trim();
    if (!trimmed) {
      throw new ValidationError("Word text is required");
    }
    if (trimmed.length > 100) {
      throw new ValidationError("Word must be 100 characters or less");
    }
    if (!input.submittedBy.trim()) {
      throw new ValidationError("Player name is required");
    }

    // Check for duplicates (case-insensitive)
    const existing = await listByRound(input.roundId);
    const duplicate = existing.find((w) => w.text.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      throw new ValidationError(`Word "${trimmed}" already exists in this round`);
    }

    const word: Info = {
      roundId: input.roundId,
      wordId: input.wordId,
      text: trimmed,
      submittedBy: input.submittedBy.trim(),
      votes: 0,
      votedBy: [],
      createdAt: new Date().toISOString(),
    };

    await client.send(
      new PutCommand({
        TableName: Resource.Words.name,
        Item: word,
      }),
    );
    return word;
  }

  export async function vote(roundId: string, wordId: string, playerName: string): Promise<void> {
    if (!playerName.trim()) {
      throw new ValidationError("Player name is required to vote");
    }

    await client.send(
      new UpdateCommand({
        TableName: Resource.Words.name,
        Key: { roundId, wordId },
        UpdateExpression:
          "SET votes = votes + :inc, votedBy = list_append(if_not_exists(votedBy, :empty), :player)",
        ConditionExpression: "NOT contains(votedBy, :name)",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":player": [playerName.trim()],
          ":empty": [],
          ":name": playerName.trim(),
        },
      }),
    );
  }

  export async function unvote(
    roundId: string,
    wordId: string,
    playerName: string,
  ): Promise<void> {
    if (!playerName.trim()) {
      throw new ValidationError("Player name is required to unvote");
    }
    const trimmedName = playerName.trim();

    // Read current word to find player's index in votedBy
    const words = await listByRound(roundId);
    const word = words.find((w) => w.wordId === wordId);
    if (!word) {
      throw new ValidationError("Word not found");
    }

    const playerIndex = word.votedBy.indexOf(trimmedName);
    if (playerIndex === -1) {
      throw new ValidationError("Player has not voted for this word");
    }

    // Remove player from votedBy and decrement votes
    const newVotedBy = word.votedBy.filter((name) => name !== trimmedName);
    await client.send(
      new UpdateCommand({
        TableName: Resource.Words.name,
        Key: { roundId, wordId },
        UpdateExpression: "SET votes = :newVotes, votedBy = :newVotedBy",
        ConditionExpression: "contains(votedBy, :name)",
        ExpressionAttributeValues: {
          ":newVotes": Math.max(0, word.votes - 1),
          ":newVotedBy": newVotedBy,
          ":name": trimmedName,
        },
      }),
    );
  }

  export async function listByRound(roundId: string): Promise<Info[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: Resource.Words.name,
        KeyConditionExpression: "roundId = :roundId",
        ExpressionAttributeValues: { ":roundId": roundId },
      }),
    );
    return (result.Items ?? []) as Info[];
  }

  export async function listByVotes(roundId: string): Promise<Info[]> {
    const words = await listByRound(roundId);
    return words.sort((a, b) => b.votes - a.votes || a.text.localeCompare(b.text));
  }
}
