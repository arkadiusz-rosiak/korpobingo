import { boardsTable, playersTable, roundsTable, wordsTable } from "./storage";

const tables = [roundsTable, wordsTable, playersTable, boardsTable];

const functionTransform: sst.aws.ApiGatewayV2RouteArgs["transform"] = {
  function: {
    runtime: "nodejs22.x",
    logging: {
      retention: "30 days",
    },
  },
};

export const api = new sst.aws.ApiGatewayV2("Api", {
  cors: {
    allowOrigins: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  },
});

api.route("ANY /rounds", {
  handler: "packages/functions/src/rounds.handler",
  link: tables,
  transform: functionTransform,
});

api.route("ANY /words", {
  handler: "packages/functions/src/words.handler",
  link: tables,
  transform: functionTransform,
});

api.route("ANY /players", {
  handler: "packages/functions/src/players.handler",
  link: tables,
  transform: functionTransform,
});

api.route("ANY /boards", {
  handler: "packages/functions/src/boards.handler",
  link: tables,
  transform: functionTransform,
});
