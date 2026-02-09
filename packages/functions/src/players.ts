import { Handler } from "aws-lambda";
import { Player } from "@korpobingo/core/player";

export const handler: Handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    switch (method) {
      case "POST": {
        const player = await Player.register({
          roundId: body.roundId,
          playerName: body.playerName,
        });
        return json(201, player);
      }
      case "GET": {
        const roundId = getParam(event, "roundId");
        if (!roundId) return json(400, { error: "Brak roundId" });
        const playerName = getParam(event, "playerName");
        if (playerName) {
          const player = await Player.get(roundId, playerName);
          if (!player) return json(404, { error: "Gracz nie znaleziony" });
          return json(200, player);
        }
        const players = await Player.listByRound(roundId);
        return json(200, players);
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
