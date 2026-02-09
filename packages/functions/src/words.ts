import { Handler } from "aws-lambda";
import { Word } from "@korpobingo/core/word";
import crypto from "crypto";

export const handler: Handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    switch (method) {
      case "POST": {
        if (body.action === "vote") {
          await Word.vote(body.roundId, body.wordId);
          return json(200, { ok: true });
        }
        const word = await Word.submit({
          roundId: body.roundId,
          wordId: crypto.randomUUID(),
          text: body.text,
          submittedBy: body.submittedBy,
        });
        return json(201, word);
      }
      case "GET": {
        const roundId = getParam(event, "roundId");
        if (!roundId) return json(400, { error: "Brak roundId" });
        const sortBy = getParam(event, "sortBy");
        const words =
          sortBy === "votes"
            ? await Word.listByVotes(roundId)
            : await Word.listByRound(roundId);
        return json(200, words);
      }
      default:
        return json(405, { error: "Niedozwolona metoda" });
    }
  } catch (err) {
    console.error(err);
    return json(500, { error: "Błąd serwera" });
  }
};

function getParam(event: any, name: string): string | undefined {
  return event.queryStringParameters?.[name];
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
