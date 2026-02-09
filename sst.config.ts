/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "korpobingo",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const api = await import("./infra/api");
    const { web } = await import("./infra/web");

    return {
      RoundsTable: storage.roundsTable.name,
      WordsTable: storage.wordsTable.name,
      PlayersTable: storage.playersTable.name,
      BoardsTable: storage.boardsTable.name,
      RoundsApiUrl: api.roundsApi.url,
      WordsApiUrl: api.wordsApi.url,
      PlayersApiUrl: api.playersApi.url,
      BoardsApiUrl: api.boardsApi.url,
      WebUrl: web.url,
    };
  },
});
