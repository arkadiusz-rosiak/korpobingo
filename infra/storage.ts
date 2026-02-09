export const roundsTable = new sst.aws.Dynamo("Rounds", {
  fields: {
    roundId: "string",
    shareCode: "string",
  },
  primaryIndex: { hashKey: "roundId" },
  globalIndexes: {
    byShareCode: { hashKey: "shareCode" },
  },
});

export const wordsTable = new sst.aws.Dynamo("Words", {
  fields: {
    roundId: "string",
    wordId: "string",
  },
  primaryIndex: { hashKey: "roundId", rangeKey: "wordId" },
});

export const playersTable = new sst.aws.Dynamo("Players", {
  fields: {
    roundId: "string",
    playerName: "string",
  },
  primaryIndex: { hashKey: "roundId", rangeKey: "playerName" },
});

export const boardsTable = new sst.aws.Dynamo("Boards", {
  fields: {
    roundId: "string",
    playerName: "string",
  },
  primaryIndex: { hashKey: "roundId", rangeKey: "playerName" },
});
