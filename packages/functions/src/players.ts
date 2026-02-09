import { Player } from "@korpobingo/core/player";
import { getMethod, getParam, json, parseBody, requireParam, wrapHandler } from "./middleware.js";

export const handler = wrapHandler(async (event) => {
  const method = getMethod(event);

  switch (method) {
    case "POST": {
      const body = parseBody(event);
      if (body.action === "verify") {
        const roundId = body.roundId as string;
        const playerName = body.playerName as string;
        const pin = body.pin as string;
        if (!roundId || !playerName || !pin) {
          return json(400, {
            error: "roundId, playerName, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const valid = await Player.verifyPin(roundId, playerName, pin);
        if (!valid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        return json(200, { ok: true });
      }
      const player = await Player.register({
        roundId: body.roundId as string,
        playerName: body.playerName as string,
        pin: body.pin as string,
      });
      return json(201, player);
    }
    case "GET": {
      const roundId = requireParam(event, "roundId");
      const playerName = getParam(event, "playerName");
      if (playerName) {
        const player = await Player.get(roundId, playerName);
        if (!player) return json(404, { error: "Player not found", code: "NOT_FOUND" });
        // Return public info only (strip pinHash)
        return json(200, {
          roundId: player.roundId,
          playerName: player.playerName,
          joinedAt: player.joinedAt,
        });
      }
      const players = await Player.listByRound(roundId);
      return json(200, players);
    }
    default:
      return json(405, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }
});
