import { boardsTable, playersTable, roundsTable, wordsTable } from "./storage";

const tables = [roundsTable, wordsTable, playersTable, boardsTable];

export const roundsApi = new sst.aws.Function("RoundsApi", {
  url: {
    cors: {
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
    },
  },
  link: tables,
  handler: "packages/functions/src/rounds.handler",
});

export const wordsApi = new sst.aws.Function("WordsApi", {
  url: {
    cors: {
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
    },
  },
  link: tables,
  handler: "packages/functions/src/words.handler",
});

export const playersApi = new sst.aws.Function("PlayersApi", {
  url: {
    cors: {
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
    },
  },
  link: tables,
  handler: "packages/functions/src/players.handler",
});

export const boardsApi = new sst.aws.Function("BoardsApi", {
  url: {
    cors: {
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
    },
  },
  link: tables,
  handler: "packages/functions/src/boards.handler",
});
