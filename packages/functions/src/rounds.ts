import crypto from "node:crypto";
import { Board } from "@korpobingo/core/board";
import { Player } from "@korpobingo/core/player";
import { Round } from "@korpobingo/core/round";
import { Word } from "@korpobingo/core/word";
import { getMethod, getParam, json, parseBody, wrapHandler } from "./middleware.js";

export const handler = wrapHandler(async (event) => {
  const method = getMethod(event);

  switch (method) {
    case "POST": {
      const body = parseBody(event);
      if (body.action === "updateStatus") {
        const roundId = body.roundId as string;
        const status = body.status as Round.Info["status"];
        const playerName = body.playerName as string;
        const pin = body.pin as string;
        if (!roundId || !status || !playerName || !pin) {
          return json(400, {
            error: "roundId, status, playerName, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        const round = await Round.get(roundId);
        if (!round) {
          return json(404, { error: "Round not found", code: "NOT_FOUND" });
        }

        await Round.updateStatus(roundId, status);

        // When starting the game, create boards for all registered players
        if (status === "playing") {
          const players = await Player.listByRound(roundId);
          const words = await Word.listByVotes(roundId);
          const totalCells = round.boardSize * round.boardSize;
          const wordTexts = words.slice(0, totalCells).map((w) => w.text);

          await Promise.all(
            players.map((p) =>
              Board.create({
                roundId,
                playerName: p.playerName,
                words: wordTexts,
                size: round.boardSize,
              }),
            ),
          );
        }

        return json(200, { ok: true });
      }
      const round = await Round.create({
        roundId: crypto.randomUUID(),
        name: body.name as string,
        boardSize: body.boardSize as 3 | 4 | undefined,
        durationDays: body.durationDays as number | undefined,
      });
      return json(201, round);
    }
    case "GET": {
      const shareCode = getParam(event, "shareCode");
      if (shareCode) {
        const round = await Round.getByShareCode(shareCode);
        if (!round) return json(404, { error: "Round not found", code: "NOT_FOUND" });
        return json(200, round);
      }
      const roundId = getParam(event, "roundId");
      if (roundId) {
        const round = await Round.get(roundId);
        if (!round) return json(404, { error: "Round not found", code: "NOT_FOUND" });
        return json(200, round);
      }
      const rounds = await Round.list();
      return json(200, rounds);
    }
    case "DELETE": {
      const roundId = getParam(event, "roundId");
      if (!roundId) {
        return json(400, { error: "roundId is required", code: "VALIDATION_ERROR" });
      }
      await Round.remove(roundId);
      return json(200, { ok: true });
    }
    default:
      return json(405, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }
});
