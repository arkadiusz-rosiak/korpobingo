import { Handler } from "aws-lambda";
import { Board } from "@korpobingo/core/board";
import { Word } from "@korpobingo/core/word";

export const handler: Handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    switch (method) {
      case "POST": {
        if (body.action === "mark") {
          await Board.markCell(body.roundId, body.playerName, body.cellIndex);
          const board = await Board.get(body.roundId, body.playerName);
          if (!board) return json(404, { error: "Plansza nie znaleziona" });
          const hasBingo = Board.checkBingo(board.marked, board.size);
          return json(200, { ...board, hasBingo });
        }
        const words = await Word.listByVotes(body.roundId);
        const wordTexts = words.map((w) => w.text);
        const board = await Board.create({
          roundId: body.roundId,
          playerName: body.playerName,
          words: wordTexts,
          size: body.size ?? 4,
        });
        return json(201, board);
      }
      case "GET": {
        const roundId = getParam(event, "roundId");
        const playerName = getParam(event, "playerName");
        if (!roundId || !playerName)
          return json(400, { error: "Brak roundId lub playerName" });
        const board = await Board.get(roundId, playerName);
        if (!board) return json(404, { error: "Plansza nie znaleziona" });
        const hasBingo = Board.checkBingo(board.marked, board.size);
        return json(200, { ...board, hasBingo });
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
