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
    $transform(aws.lambda.FunctionUrl, (args, opts, name) => {
      new aws.lambda.Permission(`${name}InvokePermission`, {
        action: "lambda:InvokeFunction",
        function: args.functionName,
        principal: "*",
      });
    });

    const storage = await import("./infra/storage");
    const api = await import("./infra/api");
    const { web } = await import("./infra/web");
    await import("./infra/monitoring");

    return {
      RoundsTable: storage.roundsTable.name,
      WordsTable: storage.wordsTable.name,
      PlayersTable: storage.playersTable.name,
      BoardsTable: storage.boardsTable.name,
      ApiUrl: api.api.url,
      WebUrl: web.url,
    };
  },
});
