import { Handler } from "aws-lambda";
import { Round } from "@korpobingo/core/round";
import crypto from "crypto";

export const handler: Handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    switch (method) {
      case "POST": {
        if (body.action === "updateStatus") {
          await Round.updateStatus(body.roundId, body.status);
          return json(200, { ok: true });
        }
        const round = await Round.create({
          roundId: crypto.randomUUID(),
          name: body.name,
          boardSize: body.boardSize,
          durationDays: body.durationDays,
        });
        return json(201, round);
      }
      case "GET": {
        const roundId = getParam(event, "roundId");
        const shareCode = getParam(event, "shareCode");
        if (shareCode) {
          const round = await Round.getByShareCode(shareCode);
          if (!round) return json(404, { error: "Runda nie znaleziona" });
          return json(200, round);
        }
        if (roundId) {
          const round = await Round.get(roundId);
          if (!round) return json(404, { error: "Runda nie znaleziona" });
          return json(200, round);
        }
        const rounds = await Round.list();
        return json(200, rounds);
      }
      case "DELETE": {
        const roundId = getParam(event, "roundId");
        if (!roundId) return json(400, { error: "Brak roundId" });
        await Round.remove(roundId);
        return json(200, { ok: true });
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
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
