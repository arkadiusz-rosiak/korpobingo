import crypto from "node:crypto";
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
        if (!roundId || !wordId || !playerName) {
          return json(400, {
            error: "roundId, wordId, and playerName are required",
            code: "VALIDATION_ERROR",
          });
        }
        await Word.vote(roundId, wordId, playerName);
        return json(200, { ok: true });
      }
      const word = await Word.submit({
        roundId: body.roundId as string,
        wordId: crypto.randomUUID(),
        text: body.text as string,
        submittedBy: body.submittedBy as string,
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
