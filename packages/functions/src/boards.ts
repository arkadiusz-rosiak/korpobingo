import { Board } from "@korpobingo/core/board";
import { Round } from "@korpobingo/core/round";
import { Word } from "@korpobingo/core/word";
import { getMethod, json, parseBody, requireParam, wrapHandler } from "./middleware.js";

export const handler = wrapHandler(async (event) => {
  const method = getMethod(event);

  switch (method) {
    case "POST": {
      const body = parseBody(event);

      if (body.action === "mark") {
        const roundId = body.roundId as string;
        const playerName = body.playerName as string;
        const cellIndex = body.cellIndex as number;
        if (!roundId || !playerName || cellIndex === undefined) {
          return json(400, {
            error: "roundId, playerName, and cellIndex are required",
            code: "VALIDATION_ERROR",
          });
        }
        const board = await Board.markCell(roundId, playerName, cellIndex);
        const bingo = Board.checkBingo(board.marked, board.size);
        return json(200, { ...board, hasBingo: bingo.hasBingo, bingoLines: bingo.lines });
      }

      // Create board from top-voted words
      const roundId = body.roundId as string;
      const playerName = body.playerName as string;
      if (!roundId || !playerName) {
        return json(400, {
          error: "roundId and playerName are required",
          code: "VALIDATION_ERROR",
        });
      }

      const round = await Round.get(roundId);
      if (!round) {
        return json(404, { error: "Round not found", code: "NOT_FOUND" });
      }

      const words = await Word.listByVotes(roundId);
      const wordTexts = words.map((w) => w.text);
      const board = await Board.create({
        roundId,
        playerName,
        words: wordTexts,
        size: round.boardSize,
      });
      return json(201, board);
    }
    case "GET": {
      const roundId = requireParam(event, "roundId");
      const playerName = requireParam(event, "playerName");
      const board = await Board.get(roundId, playerName);
      if (!board) return json(404, { error: "Board not found", code: "NOT_FOUND" });
      const bingo = Board.checkBingo(board.marked, board.size);
      return json(200, { ...board, hasBingo: bingo.hasBingo, bingoLines: bingo.lines });
    }
    default:
      return json(405, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }
});
