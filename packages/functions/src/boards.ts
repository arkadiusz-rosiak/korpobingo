import { Board } from "@korpobingo/core/board";
import { Player } from "@korpobingo/core/player";
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
        const pin = body.pin as string;
        if (!roundId || !playerName || cellIndex === undefined || !pin) {
          return json(400, {
            error: "roundId, playerName, cellIndex, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        const markRound = await Round.get(roundId);
        if (!markRound || markRound.status === "collecting") {
          return json(400, {
            error: "Round is still in collecting phase",
            code: "ROUND_NOT_PLAYING",
          });
        }
        const board = await Board.markCell(roundId, playerName, cellIndex);
        const bingo = Board.checkBingo(board.marked, board.size);
        if (bingo.hasBingo) {
          console.log(
            JSON.stringify({
              level: "INFO",
              event: "BINGO_ACHIEVED",
              roundId,
              playerName,
              lines: bingo.lines.length,
            }),
          );
        }
        return json(200, { ...board, hasBingo: bingo.hasBingo, bingoLines: bingo.lines });
      }

      if (body.action === "unmark") {
        const roundId = body.roundId as string;
        const playerName = body.playerName as string;
        const cellIndex = body.cellIndex as number;
        const pin = body.pin as string;
        if (!roundId || !playerName || cellIndex === undefined || !pin) {
          return json(400, {
            error: "roundId, playerName, cellIndex, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        const unmarkRound = await Round.get(roundId);
        if (!unmarkRound || unmarkRound.status === "collecting") {
          return json(400, {
            error: "Round is still in collecting phase",
            code: "ROUND_NOT_PLAYING",
          });
        }
        const board = await Board.unmarkCell(roundId, playerName, cellIndex);
        const bingo = Board.checkBingo(board.marked, board.size);
        return json(200, { ...board, hasBingo: bingo.hasBingo, bingoLines: bingo.lines });
      }

      if (body.action === "leave") {
        const roundId = body.roundId as string;
        const playerName = body.playerName as string;
        const pin = body.pin as string;
        if (!roundId || !playerName || !pin) {
          return json(400, {
            error: "roundId, playerName, and pin are required",
            code: "VALIDATION_ERROR",
          });
        }
        const pinValid = await Player.verifyPin(roundId, playerName, pin);
        if (!pinValid) {
          return json(401, { error: "Invalid PIN", code: "INVALID_PIN" });
        }
        await Board.remove(roundId, playerName);
        await Player.remove(roundId, playerName);
        return json(200, { ok: true });
      }

      // Create board from top-voted words
      const roundId = body.roundId as string;
      const playerName = body.playerName as string;
      const pin = body.pin as string;
      if (!roundId || !playerName || !pin) {
        return json(400, {
          error: "roundId, playerName, and pin are required",
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
      if (round.status === "collecting") {
        return json(400, {
          error: "Round is still in collecting phase",
          code: "ROUND_NOT_PLAYING",
        });
      }

      const words = await Word.listByVotes(roundId);
      const totalCells = round.boardSize * round.boardSize;
      const wordTexts = words.slice(0, totalCells).map((w) => w.text);
      const board = await Board.create({
        roundId,
        playerName,
        words: wordTexts,
        size: round.boardSize,
      });
      const bingo = Board.checkBingo(board.marked, board.size);
      return json(201, { ...board, hasBingo: bingo.hasBingo, bingoLines: bingo.lines });
    }
    case "GET": {
      const roundId = requireParam(event, "roundId");
      const playerName = requireParam(event, "playerName");
      const getRound = await Round.get(roundId);
      if (getRound && getRound.status === "collecting") {
        return json(409, {
          error: "Round is still in collecting phase",
          code: "ROUND_NOT_PLAYING",
        });
      }
      const board = await Board.get(roundId, playerName);
      if (!board) return json(404, { error: "Board not found", code: "NOT_FOUND" });
      const bingo = Board.checkBingo(board.marked, board.size);
      return json(200, { ...board, hasBingo: bingo.hasBingo, bingoLines: bingo.lines });
    }
    default:
      return json(405, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }
});
