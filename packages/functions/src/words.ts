import crypto from "node:crypto";
import { Player } from "@korpobingo/core/player";
import { Word } from "@korpobingo/core/word";
import { getMethod, getParam, json, parseBody, requireParam, wrapHandler } from "./middleware.js";

export const handler = wrapHandler(async (event) => {
  const method = getMethod(event);

  switch (method) {
    case "POST": {
      const body = parseBody(event);
      if (body.action === "vote") {
        const roundId = body.roundId as string;
        const wordId = body.wordId as string;
        const playerName = body.playerName as string;
        const pin = body.pin as string;
        if (!roundId || !wordId || !playerName || !pin) {
          return json(400, {
            error: "roundId, wordId, playerName, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        await Word.vote(roundId, wordId, playerName);
        return json(200, { ok: true });
      }
      if (body.action === "unvote") {
        const roundId = body.roundId as string;
        const wordId = body.wordId as string;
        const playerName = body.playerName as string;
        const pin = body.pin as string;
        if (!roundId || !wordId || !playerName || !pin) {
          return json(400, {
            error: "roundId, wordId, playerName, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        await Word.unvote(roundId, wordId, playerName);
        return json(200, { ok: true });
      }
      if (body.action === "delete") {
        const roundId = body.roundId as string;
        const wordId = body.wordId as string;
        const playerName = body.playerName as string;
        const pin = body.pin as string;
        if (!roundId || !wordId || !playerName || !pin) {
          return json(400, {
            error: "roundId, wordId, playerName, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        await Word.remove(roundId, wordId, playerName);
        return json(200, { ok: true });
      }
      const roundId = body.roundId as string;
      const submittedBy = body.submittedBy as string;
      const pin = body.pin as string;
      if (!roundId || !submittedBy || !pin) {
        return json(400, {
          error: "roundId, submittedBy, and pin are required",
          code: "VALIDATION_ERROR",
        });
      }
      const pinValid = await Player.verifyPin(roundId, submittedBy, pin);
      if (!pinValid) {
        return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
      }
      const word = await Word.submit({
        roundId,
        wordId: crypto.randomUUID(),
        text: body.text as string,
        submittedBy,
      });
      return json(201, word);
    }
    case "GET": {
      const roundId = requireParam(event, "roundId");
      const sortBy = getParam(event, "sortBy");
      const words =
        sortBy === "votes" ? await Word.listByVotes(roundId) : await Word.listByRound(roundId);
      return json(200, words);
    }
    default:
      return json(405, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }
});
