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
    await import("./infra/api");
    await import("./infra/web");

    return {
      RoundsTable: storage.roundsTable.name,
      WordsTable: storage.wordsTable.name,
      PlayersTable: storage.playersTable.name,
      BoardsTable: storage.boardsTable.name,
    };
  },
});
