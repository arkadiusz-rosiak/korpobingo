import { roundsTable, wordsTable, playersTable, boardsTable } from "./storage";

const tables = [roundsTable, wordsTable, playersTable, boardsTable];

export const roundsApi = new sst.aws.Function("RoundsApi", {
  url: true,
  link: tables,
  handler: "packages/functions/src/rounds.handler",
});

export const wordsApi = new sst.aws.Function("WordsApi", {
  url: true,
  link: tables,
  handler: "packages/functions/src/words.handler",
});

export const playersApi = new sst.aws.Function("PlayersApi", {
  url: true,
  link: tables,
  handler: "packages/functions/src/players.handler",
});

export const boardsApi = new sst.aws.Function("BoardsApi", {
  url: true,
  link: tables,
  handler: "packages/functions/src/boards.handler",
});
